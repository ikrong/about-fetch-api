fetch(`ENV_HOST_URL/timeout?delay=5000`, {
    signal: AbortSignal.timeout(3000),
})
    .then((response) => response.text())
    .then((text) => console.log(text))
    .catch((reason) => console.error(reason.message));
