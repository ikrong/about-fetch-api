const es = new EventSource(`ENV_HOST_URL/eventStream`);

es.addEventListener("open", () => {
    console.log("开始接收事件");
});

es.addEventListener("content", (e) => {
    const msg = JSON.parse(e.data);
    console.log(msg.data);
});

es.addEventListener("end", () => {
    es.close();
    console.log("事件接收结束");
});

es.addEventListener("error", (e) => {
    if (es.readyState === es.CLOSED) {
        console.log("事件接收结束");
    } else if (es.readyState === es.CONNECTING) {
        console.log("准备接收下一轮事件");
    }
});
