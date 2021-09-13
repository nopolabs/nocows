const getToken = function() {
    return fetch('/api/token')
        .then(response => {
            if (!response.ok) { throw Error(response.statusText); }
            return response.text();
        });
}

const getWords = function(hive, word, proof, handleWords) {
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

export { getToken, getWords };
