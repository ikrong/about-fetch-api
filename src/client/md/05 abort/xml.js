const xhr = new XMLHttpRequest();
xhr.open("GET", "ENV_HOST_URL/timeout?delay=10000", true);

xhr.onload = () => {
    if (xhr.status === 200) {
        console.log(xhr.responseText);
    }
};

xhr.onabort = () => {
    console.error("Aborted");
};

xhr.send();

setTimeout(() => {
    xhr.abort();
}, 3000);
