const xhr = new XMLHttpRequest();
xhr.onreadystatechange = (e) => {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
            const img = document.createElement("img");
            img.src = URL.createObjectURL(xhr.response);
            document.body.append(img);
        }
    }
};
xhr.responseType = "blob";
xhr.open("get", `ENV_HOST_URL/assets/ggbond.jpg`, true);
xhr.send();
