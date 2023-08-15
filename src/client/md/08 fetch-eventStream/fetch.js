fetch(`ENV_HOST_URL/eventStream?autoend=true`).then((response) => {
    if (response.ok && response.headers.get("content-type").startsWith("text/event-stream")) {
        const reader = response.body.getReader();

        async function read() {
            const { value, done } = await reader.read();
            if (!done) {
                const msgList = new TextDecoder("utf8").decode(value);
                msgList.split("\n\n").map((msg) => {
                    console.log(msg);
                });
                return read();
            }
        }

        return read();
    }
});
