fetch(`ENV_HOST_URL/assets/file.blob`)
    .then((response) => {
        const length = response.headers.get("content-length");
        let currentLength = 0;
        const reader = response.body.getReader();
        const chunks = [];

        async function read() {
            const { done, value } = await reader.read();
            if (done) {
                console.log(`下载完成`);
                return new Blob(chunks);
            } else {
                currentLength += value.byteLength;
                chunks.push(value);
                console.log(`下载进度: ${Math.round((currentLength * 100) / length)}%`);
                return read();
            }
        }

        return read();
    })
    .then((blob) => {
        console.log("文件大小: " + blob.size);
    });
