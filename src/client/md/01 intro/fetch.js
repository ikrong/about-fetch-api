fetch(`ENV_HOST_URL/`)
    .then((response) => response.text())
    .then((text) => {
        console.log(text);
    });
