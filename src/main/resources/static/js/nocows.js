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

    function handleWords(words) {
        const spelled = Nocows.spelled;
        words.forEach(word => {
            spelled.add(capitalize(word));
        });
        Nocows.spelled = spelled;
        Nocows.word = '';
    }

    function onSolution() {
        getToken()
            .then(token => {
                const hive = Nocows.hive;
                proof(token + ':' + hive)
                    .then(proof => {
                        getWords(hive, '', proof, handleWords);
                    })
            })
    }

    function onCheck() {
        getToken()
            .then(token => {
                const hive = Nocows.hive;
                const word = Nocows.word;
                proof(token + ':' + hive + ':' + word)
                    .then(proof => {
                        getWords(hive, word, proof, handleWords);
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
        const word = Nocows.word;
        Nocows.word = word + event.target.value.toLowerCase();
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

document.addEventListener('DOMContentLoaded', init);
