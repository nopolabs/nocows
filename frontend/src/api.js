import { proof } from './proof';

const getToken = function() {
    return fetch('/api/token')
        .then(response => {
            if (!response.ok) { throw Error(response.statusText); }
            return response.text();
        });
}

const getWords = function(hive, word, handleWords) {
    console.log('getWords', hive, word);
    const path = '/cows/' + hive + (word === ''  ? '' : '/' + word.toLowerCase());
    getToken()
        .then(token => {
            proof(token + ':' + path)
                .then(proof => {
                    const params = new URLSearchParams({ proof: proof });
                    const url = '/api' + path + '?' + params;
                    fetch(url)
                        .then(response => {
                            if (!response.ok) { throw Error(response.statusText); }
                            return response.json();
                        })
                        .then(json => {
                            handleWords(json.words)
                        })
                        .catch(error => {
                            console.log(error);
                        });
                });
        });
}

const getHive = function(handleHive) {
    const path = '/hive';
    getToken()
        .then(token => {
            proof(token + ':' + path)
                .then(proof => {
                    const params = new URLSearchParams({ proof: proof });
                    const url = '/api' + path + '?' + params;
                    fetch(url)
                        .then(response => {
                            if (!response.ok) { throw Error(response.statusText); }
                            return response.text();
                        })
                        .then(hive => {
                            handleHive(hive)
                        })
                        .catch(error => {
                            console.log(error);
                        });
                });
        });
}

export { getHive, getWords };
