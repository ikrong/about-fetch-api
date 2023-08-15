fetch(`ENV_HOST_URL/assets/ggbond.jpg`)
    .then((response) => response.blob())
    .then((blob) => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(blob);
        document.body.append(img);
    });
