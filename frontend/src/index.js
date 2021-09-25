import { getHive, solve, check } from './api';
import { score, words, capitalize } from './bee';
import { shuffle } from './shuffle';
import { initGrid } from './grid';

function init() {

    const Nocows = function () {

        const handler = {
            set: function(obj, prop, value) {
                // console.log('set', prop, value);
                obj[prop] = value;
                switch (prop) {
                    case 'hive': updateHive(value); break;
                    case 'count': updateCount(value); break;
                    case 'total': updateTotal(value); break;
                    case 'word': updateWord(value); break;
                    case 'spelled': updateSpelled(value); break;
                }
                return true; // success!
            },
        };

        const state = new Proxy({
            hive: '',
            count: 0,
            total: 0,
            word: '',
            spelled: new Set(),
        }, handler);

        const grid = initGrid(document.getElementById('grid'), clickIndex);

        function clickIndex(index) {
            if (index < 0 || index > 6) {
                return
            }
            const word = state.word;
            state.word = word + state.hive.charAt(index);
        }

        function updateHive(value) {
            console.log('updateHive', value, state.hive)
            document.getElementById('letter-0').value = value.charAt(0).toUpperCase();
            document.getElementById('letter-1').value = value.charAt(1).toUpperCase();
            document.getElementById('letter-2').value = value.charAt(2).toUpperCase();
            document.getElementById('letter-3').value = value.charAt(3).toUpperCase();
            document.getElementById('letter-4').value = value.charAt(4).toUpperCase();
            document.getElementById('letter-5').value = value.charAt(5).toUpperCase();
            document.getElementById('letter-6').value = value.charAt(6).toUpperCase();

            grid.draw(value)
        }

        function updateCount(value) {
            // console.log('updateCount', value, state.count)
            document.getElementById('count').innerText = value;
        }

        function updateTotal(value) {
            // console.log('updateTotal', value, state.total);
            document.getElementById('total').innerText = value;
        }

        function updateWord(value) {
            // console.log('updateWord', value, state.word)
            document.getElementById('word').value = value;
        }

        function updateSpelled(value) {
            // console.log('updateSpelled', value, state.spelled)
            document.getElementById('score').innerText = score(value, state.hive);
            document.getElementById('words').innerHTML = words(value, state.hive);
            state.count = value.size;
        }

        return state;
    }();

    function onSolution() {
        solve(Nocows.hive, json => {
            const spelled = Nocows.spelled;
            json.words.forEach(word => {
                spelled.add(capitalize(word));
            });
            Nocows.spelled = spelled;
            Nocows.word = '';
        });
    }

    function onCheck() {
        check(Nocows.hive, Nocows.word, json => {
            const spelled = Nocows.spelled;
            if (json.found) {
                spelled.add(capitalize(json.word));
                Nocows.spelled = spelled;
            }
            Nocows.word = '';
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

    getHive(json => {
        // console.log(json);
        Nocows.hive = json.hive;
        Nocows.total = json.total;
    });
}

document.addEventListener('DOMContentLoaded', init);
