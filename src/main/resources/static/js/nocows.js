function init() {

    const crypto = window.crypto.subtle;

    // SHA-256 hash of str, returns Uint8Array
    function sha256(str) {
        var buffer = new TextEncoder("utf-8").encode(str)
        return crypto.digest("SHA-256", buffer);
    }

    async function proof(data) {
        var nonce = 0;
        do {
            var candidate = nonce + ":" + data;
            var hash = await sha256(candidate);
            var view = new DataView(hash);
            var value = view.getUint16(0) & 0xFFF0; // first 12 bits
            if (value === 0) {
                return candidate;
            }
            nonce++
        } while(true);
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

    function check(hive, word, token) {
        proof(token + ":" + word)
            .then(proof => {
                const params = new URLSearchParams({ proof: proof });
                const url = "/api/" + hive + "/" + word + "?" + params;
                document.getElementById('url').innerText = url;
                fetch(url)
                    .then(response => {
                        if (!response.ok) { throw Error(response.statusText);}
                        return response.json();
                    })
                    .then((json) => {
                        console.log(json);
                        document.getElementById('result').innerText = JSON.stringify(json);
                    })
                    .catch(error => {
                        console.log(error);
                        document.getElementById('result').innerText = error;
                    });
            })
            .catch(error => { console.log(error); });
    }

    function submit(token) {
        const hive = document.getElementById('hive').innerText;
        const word = document.getElementById('word').value;
        document.getElementById('url').innerText = "";
        document.getElementById('result').innerText = "";
        check(hive, word, token);
    }

    function onSubmit() {
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

    document.getElementById('submit-button').onclick = onSubmit;
    document.getElementById('delayed-submit-button').onclick = onDelayedSubmit;
}

document.addEventListener("DOMContentLoaded", init);
