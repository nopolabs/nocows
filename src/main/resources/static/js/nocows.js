function init() {

    const crypto = window.crypto.subtle;

    var spelled = new Set();

    // SHA-256 hash of str, returns Uint8Array
    function sha256(str) {
        var buffer = new TextEncoder("utf-8").encode(str)
        return crypto.digest("SHA-256", buffer);
    }

    async function proof(data) {
        var nonce = 0;
        while(true) {
            var candidate = nonce + ":" + data;
            var hash = await sha256(candidate);
            var view = new DataView(hash);
            var value = view.getUint16(0) & 0xFFF0; // first 12 bits
            if (value === 0) {
                return candidate;
            }
            nonce++
        }
    }

    function getToken() {
        return fetch("/api/token")
            .then(response => {
                if (!response.ok) { throw Error(response.statusText);}
                return response.text();
            });
    }

    function getHeaderToken() {
        return fetch("/api/headerToken")
            .then(response => {
                if (!response.ok) { throw Error(response.statusText);}
                return response.headers.get("nocows-token");
            });
    }

    function score(words) {
        return [...words].reduce(function(score, word){
            if (word.length < 4) {
                return score;
            }
            if (word.length === 4) {
                return score + 1;
            }
            return score + word.length;
        }, 0)
    }

    function fetchUrl(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) { throw Error(response.statusText);}
                return response.json();
            })
            .then((json) => {
                console.log(json);
                json.words.forEach(word => spelled.add(word));
                document.getElementById('score').innerText = score(spelled);
                document.getElementById('words').innerText = Array.from(spelled).join(" ");
                document.getElementById('word').value = "";
            })
            .catch(error => {
                console.log(error);
            });
    }

    function solve(hive, proof) {
        const params = new URLSearchParams({ proof: proof });
        const url = "/api/cows/" + hive + "?" + params;
        fetchUrl(url);
    }

    function check(hive, word, proof) {
        const params = new URLSearchParams({ proof: proof });
        const url = "/api/cows/" + hive + "/" + word + "?" + params;
        fetchUrl(url);
    }

    function submit(token) {
        const hive = document.getElementById('hive').innerText;
        const word = document.getElementById('word').value;
        proof(token + ":" + hive + ":" + word)
            .then(proof => {
                check(hive, word, proof);
            });
    }

    function onSubmit() {
        console.log('onSubmit');
        getToken()
            .then(token => {
                submit(token);
            });
    }

    function onDelayedSubmit() {
        getToken()
            .then(token => {
                setTimeout(() => submit(token), 1000);
            });
    }

    function formSubmit(event) {
        console.log('formSubmit');
        event.preventDefault();
        onSubmit();
    }

    function onSolution() {
        getToken()
            .then(token => {
                const hive = document.getElementById('hive').innerText;
                proof(token + ":" + hive)
                    .then(proof => {
                        solve(hive, proof);
                    })
            })
    }

    document.getElementById('submit-button').onclick = onSubmit;
    document.getElementById('delayed-submit-button').onclick = onDelayedSubmit;
    document.getElementById('solution-button').onclick = onSolution;
    document.getElementById('form').addEventListener('submit', formSubmit);
}

document.addEventListener("DOMContentLoaded", init);
