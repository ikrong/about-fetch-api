const express = require("express");
const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

const largeFileDir = path.join(__dirname, "./../client/assets/file.blob");
if (!fs.existsSync(largeFileDir)) {
    // 创建一个40M的大文件
    fs.writeFileSync(largeFileDir, Buffer.from(new ArrayBuffer(1024 * 1024 * 40)));
}

function createEventStreamMessage({ name, data, id, retry }) {
    const content = [];
    if (typeof name !== "undefined") {
        content.push(`event: ${name}`);
    }
    if (typeof data !== "undefined") {
        content.push(`data: ${JSON.stringify(data)}`);
    } else {
        content.push(`data: `);
    }
    if (typeof id !== "undefined") {
        content.push(`id: ${id}`);
    }
    if (typeof retry !== "undefined") {
        content.push(`retry: ${retry}`);
    }
    return `${content.join("\n")}\n\n`;
}

app.all("/*", express.static("src/client"));

app.get("/is-client-changed", (req, res) => {
    const c = chokidar.watch(path.join(__dirname, "../client/**/*"));
    c.on("change", () => {
        c.removeAllListeners();
        c.close();
        res.send("");
    });
});

app.get("/echo", (req, res) => {
    const data = req.query.data || "";
    res.send(data);
});

app.get("/timeout", (req, res) => {
    const timeout = req.query.delay || 10;
    const timer = setTimeout(() => {
        res.send(`在${timeout}ms后，你收到了这条响应。`);
    }, timeout);

    req.socket.on("close", () => clearTimeout(timer));
});

app.all("/eventStream", (req, res) => {
    let id = +req.headers["last-event-id"] || 0;
    const autoEnd = !!req.query.autoend;
    const maxId = id + 10;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let timer = null;

    function send() {
        ++id;
        res.write(
            createEventStreamMessage({
                name: "content",
                id,
                data: { data: `这是第${id}条数据`, time: +new Date() },
            })
        );

        if (id >= maxId) {
            if (autoEnd) {
                res.write(
                    createEventStreamMessage({
                        name: "end",
                    })
                );
            }
            res.end("\n\n");
        } else {
            timer = setTimeout(() => {
                send();
            }, 500);
        }
    }

    send();

    req.socket.on("close", () => clearTimeout(timer));
});

app.all("/chat", (req, res) => {
    const dir = path.join(__dirname, "article.txt");
    const content = fs.readFileSync(dir).toString();
    const speed = +req.query.speed || 50;
    const perText = +req.query.per || 2;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let index = 0;

    let timer = null;

    function send() {
        res.write(
            createEventStreamMessage({
                name: "content",
                id: index + 1,
                data: { content: content.substring(index * perText, index * perText + perText) },
            })
        );

        if (index * perText + perText > content.length) {
            res.write(
                createEventStreamMessage({
                    name: "end",
                })
            );
            res.end("\n\n");
        } else {
            index++;
            timer = setTimeout(() => {
                send();
            }, speed);
        }
    }

    send();

    req.socket.on("close", () => clearTimeout(timer));
});

app.listen(port, () => {
    console.log(`服务器已在 http://localhost:${port} 上运行`);
});
