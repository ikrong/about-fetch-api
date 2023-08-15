const xhr = new XMLHttpRequest();
xhr.onreadystatechange = (e) => {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
            console.log(xhr.response);
        }
    }
};
xhr.responseType = "json";
xhr.open("get", `ENV_HOST_URL/echo?data=${JSON.stringify({ data: "json" })}`, true);
xhr.send();
