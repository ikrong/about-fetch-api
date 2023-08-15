const ctrl = new AbortController();

fetch(`ENV_HOST_URL/timeout?delay=10000`, {
    signal: ctrl.signal,
})
    .then((response) => response.text())
    .then((text) => console.log(text))
    .catch((reason) => console.error(reason.message));

setTimeout(() => {
    ctrl.abort();
}, 3000);
