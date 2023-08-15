const xhr = new XMLHttpRequest();
xhr.open("GET", "ENV_HOST_URL/timeout?delay=5000", true);
xhr.timeout = 3000;

xhr.onload = () => {
    if (xhr.status === 200) {
        console.log(xhr.responseText);
    }
};

xhr.ontimeout = () => {
    console.error("Timeout");
};

xhr.send();
