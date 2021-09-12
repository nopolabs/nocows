function getToken() {
    return fetch('/api/token')
        .then(response => {
            if (!response.ok) { throw Error(response.statusText); }
            return response.text();
        });
}

function getWords(hive, word, proof, handleWords) {
    const params = new URLSearchParams({ proof: proof });
    const path = words === '' ? '' : '/' + word.toLowerCase()
    const url = '/api/cows/' + hive + path + '?' + params;
    fetch(url)
        .then(response => {
            if (!response.ok) { throw Error(response.statusText); }
            return response.json();
        })
        .then((json) => {
            handleWords(json.words)
        })
        .catch(error => {
            console.log(error);
        });
}
