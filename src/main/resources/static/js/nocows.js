function init() {

    const crypto = window.crypto.subtle;

    const spelled = new Set();

    // SHA-256 hash of str, returns Uint8Array
    function sha256(str) {
        var buffer = new TextEncoder("utf-8").encode(str)
        return crypto.digest("SHA-256", buffer);
    }

    async function proof(data) {
        let nonce = 0;
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

    function isPangram(word) {
        if (word.length < 7) {
            return false;
        }
        const hive = document.getElementById('hive').value;
        for (var i = 0; i < hive.length; i++) {
            if (!word.includes(hive.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    function score(words) {
        return [...words].reduce(function(score, word){
            if (word.length < 4) {
                return score;
            }
            if (word.length === 4) {
                return score + 1;
            }
            if (isPangram(word)) {
                return score + word.length + 7;
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

    function onSolution() {
        getToken()
            .then(token => {
                const hive = document.getElementById('hive').value;
                proof(token + ":" + hive)
                    .then(proof => {
                        solve(hive, proof);
                    })
            })
    }

    function check(hive, word, proof) {
        const params = new URLSearchParams({ proof: proof });
        const url = "/api/cows/" + hive + "/" + word + "?" + params;
        fetchUrl(url);
    }

    function onSubmit() {
        getToken()
            .then(token => {
                const hive = document.getElementById('hive').value;
                const word = document.getElementById('word').value;
                proof(token + ":" + hive + ":" + word)
                    .then(proof => {
                        check(hive, word, proof);
                    });
            });
    }

    function formSubmit(event) {
        event.preventDefault();
        onSubmit();
    }

    function letterClick(event) {
        const letter = event.target.value;
        const word = document.getElementById('word').value;
        document.getElementById('word').value = word + letter;
    }

    function showHive() {
        const hive = document.getElementById('hive').value;
        document.getElementById('letter-0').value = hive.charAt(0);
        document.getElementById('letter-1').value = hive.charAt(1);
        document.getElementById('letter-2').value = hive.charAt(2);
        document.getElementById('letter-3').value = hive.charAt(3);
        document.getElementById('letter-4').value = hive.charAt(4);
        document.getElementById('letter-5').value = hive.charAt(5);
        document.getElementById('letter-6').value = hive.charAt(6);
    }

    showHive();

    document.getElementById('submit-button').onclick = onSubmit;
    document.getElementById('solution-button').onclick = onSolution;
    document.getElementById('form').addEventListener('submit', formSubmit);
    document.getElementById('letter-0').onclick = letterClick;
    document.getElementById('letter-1').onclick = letterClick;
    document.getElementById('letter-2').onclick = letterClick;
    document.getElementById('letter-3').onclick = letterClick;
    document.getElementById('letter-4').onclick = letterClick;
    document.getElementById('letter-5').onclick = letterClick;
    document.getElementById('letter-6').onclick = letterClick;
}

document.addEventListener("DOMContentLoaded", init);
