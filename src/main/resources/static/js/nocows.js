const crypto = window.crypto.subtle;

function random(i, n) {
    return Math.floor(Math.random() * (n - i) + i);
}

function shuffle(string) {
    let array = [...string];

    array.forEach(
        (elem, i, arr, j = random(i, arr.length)) => {
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    );

    return array.join('');
}

// SHA-256 hash of str, returns Uint8Array
function sha256(str) {
    var buffer = new TextEncoder("utf-8").encode(str)
    return crypto.digest("SHA-256", buffer);
}

async function proof(data) {
    let nonce = 0;
    while(true) {
        const candidate = nonce + ":" + data;
        const hash = await sha256(candidate);
        const view = new DataView(hash);
        const value = view.getUint16(0) & 0xFFF0; // first 12 bits
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

function isPangram(word, hive) {
    if (word.length < 7) {
        return false;
    }
    word = word.toLowerCase();
    for (var i = 0; i < hive.length; i++) {
        if (!word.includes(hive.charAt(i))) {
            return false;
        }
    }
    return true;
}

function score(words, hive) {
    return [...words].reduce(function(score, word){
        if (word.length < 4) {
            return score;
        }
        if (word.length === 4) {
            return score + 1;
        }
        if (isPangram(word, hive)) {
            return score + word.length + 7;
        }
        return score + word.length;
    }, 0)
}

function words(spelled, hive) {
    return Array.from(spelled)
        .map(word => isPangram(word, hive) ? ("<b>" + word + "</b>") : word)
        .join(" ");
}

function capitalize(word) {
    word = word.toLowerCase().replace(/[^a-z]/gi, ''); // for safety
    return word[0].toUpperCase() + word.substring(1).toLowerCase();
}

function init() {

    const Nocows = function () {

        const handler = {
            set: function(obj, prop, value) {
                obj[prop] = value;
                switch (prop) {
                    case 'hive': updateHive(); break;
                    case 'word': updateWord(); break;
                    case 'spelled': updateSpelled(); break;
                }
            },
        };

        const state = new Proxy({
            hive: '',
            word: '',
            spelled: new Set(),
        }, handler);

        function updateHive() {
            document.getElementById('letter-0').value = state.hive.charAt(0).toUpperCase();
            document.getElementById('letter-1').value = state.hive.charAt(1).toUpperCase();
            document.getElementById('letter-2').value = state.hive.charAt(2).toUpperCase();
            document.getElementById('letter-3').value = state.hive.charAt(3).toUpperCase();
            document.getElementById('letter-4').value = state.hive.charAt(4).toUpperCase();
            document.getElementById('letter-5').value = state.hive.charAt(5).toUpperCase();
            document.getElementById('letter-6').value = state.hive.charAt(6).toUpperCase();
        }

        function updateWord() {
            document.getElementById('word').value = state.word;
        }

       function updateSpelled() {
            document.getElementById('score').innerText = score(state.spelled, state.hive);
            document.getElementById('words').innerHTML = words(state.spelled, state.hive);
        }

        return state;
    }();

    function fetchUrl(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) { throw Error(response.statusText);}
                return response.json();
            })
            .then((json) => {
                const spelled = Nocows.spelled;
                json.words.forEach(word => {
                    spelled.add(capitalize(word));
                });
                Nocows.spelled = spelled;
                Nocows.word = '';
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
                const hive = Nocows.hive;
                proof(token + ":" + hive)
                    .then(proof => {
                        solve(hive, proof);
                    })
            })
    }

    function check(hive, word, proof) {
        const params = new URLSearchParams({ proof: proof });
        const url = "/api/cows/" + hive + "/" + word.toLowerCase() + "?" + params;
        fetchUrl(url);
    }

    function onCheck() {
        getToken()
            .then(token => {
                const hive = Nocows.hive;
                const word = Nocows.word;
                proof(token + ":" + hive + ":" + word)
                    .then(proof => {
                        check(hive, word, proof);
                    });
            });
    }

    function formSubmit(event) {
        event.preventDefault();
        onCheck();
    }

    function onErase() {
        Nocows.word = Nocows.word.slice(0, -1);
    }

    function onRotate() {
        const hive = Nocows.hive
        Nocows.hive = hive.charAt(0) + shuffle(hive.substring(1));
    }

    function letterClick(event) {
        Nocows.word = Nocows.word + event.target.value.toLowerCase();
    }

    document.getElementById('check-button').onclick = onCheck;
    document.getElementById('rotate-button').onclick = onRotate;
    document.getElementById('erase-button').onclick = onErase;
    document.getElementById('solution-button').onclick = onSolution;
    document.getElementById('form').addEventListener('submit', formSubmit);
    document.getElementById('letter-0').onclick = letterClick;
    document.getElementById('letter-1').onclick = letterClick;
    document.getElementById('letter-2').onclick = letterClick;
    document.getElementById('letter-3').onclick = letterClick;
    document.getElementById('letter-4').onclick = letterClick;
    document.getElementById('letter-5').onclick = letterClick;
    document.getElementById('letter-6').onclick = letterClick;

    Nocows.hive = document.getElementById('hive').value;
}

document.addEventListener("DOMContentLoaded", init);
