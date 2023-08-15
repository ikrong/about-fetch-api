!(async () => {
    const menus = Array.from(document.querySelectorAll(".container .side>div[data-md]"));
    const md = markdownit();
    const briefEl = document.querySelector(".container .body .brief");
    const runnerEl = {
        fetch: document.querySelector(".container .body .runner .fetch"),
        xml: document.querySelector(".container .body .runner .xml"),
    };
    const editor = {
        fetch: null,
        xml: null,
    };
    const consoleEl = {
        fetch: document.querySelector(".container .body .console .fetch .content"),
        xml: document.querySelector(".container .body .console .xml .content"),
    };
    const execBtnEl = document.querySelector(".exec-btn");
    const cancelBtnEl = document.querySelector(".cancel-btn");

    let currentPageName = "";
    const pages = {};

    menus.map((menuEl) => {
        menuEl.addEventListener("click", () => {
            loadPage(menuEl.getAttribute("data-md"));
        });
    });

    function formatJS(js) {
        if (typeof js === "string") {
            js = js.replace(/ENV_HOST_URL/g, location.origin);
        }
        return js;
    }

    async function loadPage(name) {
        if (!pages[name]) {
            const [readme, fetchJS, xmlJS] = await Promise.all(
                [`/md/${name}/README.md`, `/md/${name}/fetch.js`, `/md/${name}/xml.js`].map((url) =>
                    fetch(url).then(
                        (a) => (a.ok ? a.text() : null),
                        () => null
                    )
                )
            );
            pages[name] = { readme, fetchJS: formatJS(fetchJS), xmlJS: formatJS(xmlJS) };
        }
        currentPageName = name;
        showPage(name);
    }

    function createEditor(root) {
        const editor = CodeMirror(root, {
            mode: "javascript",
            lineNumbers: true,
            lineWrapping: true,
            autoRefresh: true,
            theme: "vscode-dark",
            scrollbarStyle: "null",
        });
        return editor;
    }

    function showPage(name) {
        const { readme, fetchJS, xmlJS } = pages[name];
        briefEl.innerHTML = md.render(readme);

        editor.fetch = null;
        editor.xml = null;

        runnerEl.fetch.innerHTML = ``;
        if (typeof fetchJS === "string") {
            const fetchEditor = document.createElement("div");
            runnerEl.fetch.append(fetchEditor);
            editor.fetch = createEditor(fetchEditor);
            editor.fetch.setValue(fetchJS);
            setTimeout(() => editor.fetch.refresh());
            consoleEl.fetch.parentElement.style.display = "";
        } else {
            consoleEl.fetch.parentElement.style.display = "none";
        }

        runnerEl.xml.innerHTML = ``;
        if (typeof xmlJS === "string") {
            const xmlEditor = document.createElement("div");
            runnerEl.xml.append(xmlEditor);
            editor.xml = createEditor(xmlEditor);
            editor.xml.setValue(xmlJS);
            setTimeout(() => editor.xml.refresh());
            consoleEl.xml.parentElement.style.display = "";
        } else {
            consoleEl.xml.parentElement.style.display = "none";
        }

        const url = new URL(location.origin);
        url.searchParams.append("name", btoa(encodeURIComponent(name)).replace(/=/g, ""));
        history.pushState({}, null, url.toString());

        setActive(name);

        cancelExec();

        consoleEl.fetch.innerHTML = "";
        consoleEl.xml.innerHTML = "";

        document.querySelector(".container .body .content").scrollTop = 0;
    }

    function setActive(name) {
        menus.map((menu) => {
            const menuName = menu.getAttribute("data-md");
            if (menuName === name) {
                menu.classList.add("active");
            } else {
                menu.classList.remove("active");
            }
        });
    }

    function exec() {
        cancelExec();

        const fetchJS = editor.fetch ? editor.fetch.getValue() : null;
        const xmlJS = editor.xml ? editor.xml.getValue() : null;

        consoleEl.fetch.innerHTML = "";
        consoleEl.xml.innerHTML = "";
        console.clear();
        if (typeof fetchJS === "string") {
            createSandbox("FETCH", fetchJS, (data, type) => {
                const logEl = createLogEl(data, type);
                consoleEl.fetch.append(logEl);
                logEl.scrollIntoView(false);
            });
        }
        if (typeof xmlJS === "string") {
            createSandbox("XHR", xmlJS, (data, type) => {
                const logEl = createLogEl(data, type);
                consoleEl.xml.append(logEl);
                logEl.scrollIntoView(false);
            });
        }
    }
    execBtnEl.addEventListener("click", exec);

    function cancelExec() {
        Array.from(document.querySelectorAll("body>.sandbox")).map((frame) => {
            frame.remove();
        });
    }
    cancelBtnEl.addEventListener("click", cancelExec);

    function createLogEl(data, type) {
        const el = document.createElement("div");
        const content = document.createElement("div");
        if (["string", "number", "boolean"].includes(typeof data)) {
            content.innerText = data;
        } else {
            content.innerText = JSON.stringify(data, null, 4);
        }
        content.classList.add(type);
        el.append(content);
        return el;
    }

    function createFakeContext(key) {
        return new Proxy(window.document, {
            get(d, p) {
                if (p === "body") {
                    return window.top[key];
                } else if (typeof d[p] === "function") {
                    return d[p].bind(d);
                } else {
                    return d[p];
                }
            },
        });
    }

    function createSandbox(label, js, log) {
        const colors = {
            FETCH: "#59c47e",
            XHR: "#979797",
        };

        const fakeRootElKey = `${label}_fake`;
        if (window[fakeRootElKey]) {
            window[fakeRootElKey].remove();
        }
        window[fakeRootElKey] = document.createElement("div");
        runnerEl[
            {
                FETCH: "fetch",
                XHR: "xml",
            }[label]
        ].append(window[fakeRootElKey]);

        const frame = document.createElement("iframe");
        frame.classList.add("sandbox");
        frame.style.width = "10px";
        frame.style.height = "10px";
        frame.style.position = "fixed";
        frame.style.top = "-100px";
        document.body.append(frame);
        const w = frame.contentWindow;
        w.addEventListener("error", (e) => {
            console.error(`%c${label}:`, `background: ${colors[label]};color:#fff;padding:0 10px 0 4px;`, e);
            if (typeof log === "function") {
                log(e.message, "error");
            }
        });
        w.console._log = w.console.log;
        w.console._error = w.console.error;
        w.console.log = (...args) => {
            if (document.body.contains(frame)) {
                console.log(`%c${label}:`, `background: ${colors[label]};color:#fff;padding:0 10px 0 4px;`, ...args);
                if (typeof log === "function") {
                    args.map((a) => log(a, "log"));
                }
            }
        };
        w.console.error = (...args) => {
            if (document.body.contains(frame)) {
                console.log(`%c${label}:`, `background: ${colors[label]};color:#fff;padding:0 10px 0 4px;`, ...args);
                if (typeof log === "function") {
                    args.map((a) => log(a, "error"));
                }
            }
        };
        const script = document.createElement("script");
        script.src = URL.createObjectURL(
            new Blob(
                [
                    `{
  ${createFakeContext.toString()}
  const document = createFakeContext("${fakeRootElKey}")
  ${js}
}`,
                ],
                { type: "text/script" }
            )
        );
        frame.contentDocument.body.append(script);
    }

    if (new URL(location.href).searchParams.get("name")) {
        currentPageName = decodeURIComponent(atob(new URL(location.href).searchParams.get("name")));
    } else {
        currentPageName = menus[0].getAttribute("data-md");
    }

    loadPage(currentPageName);
})();

// 自动刷新
!(() => {
    function reloadTest() {
        fetch("/is-client-changed")
            .then((a) => a.text())
            .then(() => {
                location.reload();
            })
            .catch(() => {
                setTimeout(() => {
                    reloadTest();
                }, 3000);
            });
    }

    reloadTest();
})();
