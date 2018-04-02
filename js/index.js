if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => navigator.serviceWorker.ready.then((reg) => {
            console.log('sw registered:', reg);
        }))
        .catch((err) => console.log(err));
}

