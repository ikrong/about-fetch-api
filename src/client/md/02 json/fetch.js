fetch(`ENV_HOST_URL/echo?data=${JSON.stringify({ data: "json" })}`)
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
    });
