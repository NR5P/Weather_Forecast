class HTTP {
    get(url) {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(result => result.json())
                .then(data => resolve(data))
                .catch(err => reject(err));
        });
    }
}

