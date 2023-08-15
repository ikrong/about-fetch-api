function parseEventStreamMessage(text) {
    const lines = text.split("\n");
    const message = {};
    lines.map((line) => {
        if (line.startsWith("event: ")) {
            message.event = line.substring(7);
        } else if (line.startsWith("id: ")) {
            message.id = line.substring(4);
        } else if (line.startsWith("data: ")) {
            if (typeof message.data === "undefined") {
                message.data = line.substring(6);
            } else {
                message.data += line.substring(6);
            }
        }
    });
    return message;
}

function getChat(callback) {
    fetch(`ENV_HOST_URL/chat`).then((response) => {
        if (response.ok && response.headers.get("content-type").startsWith("text/event-stream")) {
            const reader = response.body.getReader();

            async function read() {
                const { value, done } = await reader.read();
                if (!done) {
                    const msgList = new TextDecoder("utf8").decode(value);
                    msgList
                        .trim()
                        .split("\n\n")
                        .map((msg) => {
                            if (msg.trim()) {
                                callback(parseEventStreamMessage(msg));
                            }
                        });
                    return read();
                }
            }

            return read();
        }
    });
}

function main() {
    const div = document.createElement("div");
    div.classList.add("chat-box");

    const cursor = document.createElement("div");
    cursor.classList.add("chat-cursor");

    div.append(cursor);
    document.body.append(div);

    let p = null;

    getChat((msg) => {
        if (msg.event === "content") {
            const text = JSON.parse(msg.data).content;
            console.log(text);
            text.split("\n").map((line, i) => {
                const nextp = document.createElement("p");
                if (i === 0) {
                    if (!p) {
                        p = nextp;
                        div.append(p);
                    }
                } else {
                    p = nextp;
                    div.append(p);
                }
                p.textContent += line;
            });
            p.append(cursor);
            cursor.scrollIntoView();
        } else if (msg.event === "end") {
            cursor.remove();
        }
    });
}

main();
