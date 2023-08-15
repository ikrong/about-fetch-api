const xhr = new XMLHttpRequest();
xhr.onreadystatechange = (e) => {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
            console.log(xhr.responseText);
        }
    }
};
xhr.open("get", `ENV_HOST_URL/`, true);
xhr.send();
