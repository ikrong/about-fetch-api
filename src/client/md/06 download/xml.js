const xhr = new XMLHttpRequest();
xhr.open("GET", `ENV_HOST_URL/assets/file.blob`, true);
xhr.responseType = "blob";

xhr.onload = () => {
    if (xhr.status === 200) {
        const blob = xhr.response;
        console.log(`文件大小: ${blob.size}`);
    }
};

xhr.onprogress = (event) => {
    if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        console.log(`下载进度: ${progress}%`);
    }
};

xhr.send();
