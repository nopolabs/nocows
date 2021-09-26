import { getHive, solve, check } from './api';
import { score, words, capitalize } from './bee';
import { shuffle } from './shuffle';
import { initGrid } from './grid';

function init() {

    const Nocows = function (gridElement) {

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

        const grid = initGrid(gridElement, clickIndex);

        function clickIndex(index) {
            if (index < 0 || index > 6) {
                return
            }
            const word = state.word;
            state.word = word + state.hive.charAt(index);
        }

        function updateHive(value) {
            // console.log('updateHive', value, state.hive)
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

        function onSolution() {
            solve(state.hive, json => {
                const spelled = state.spelled;
                json.words.forEach(word => {
                    spelled.add(capitalize(word));
                });
                state.spelled = spelled;
                state.word = '';
            });
        }

        function onCheck() {
            if (state.word.length > 0) {
                check(state.hive, state.word, json => {
                    const spelled = state.spelled;
                    if (json.found) {
                        spelled.add(capitalize(json.word));
                        state.spelled = spelled;
                    }
                    state.word = '';
                });
            }
        }

        function onErase() {
            state.word = state.word.slice(0, -1);
        }

        function onRotate() {
            const hive = state.hive
            state.hive = hive.charAt(0) + shuffle(hive.substring(1));
        }

        function setHive(hive) {
            state.hive = hive
        }

        function setTotal(total) {
            state.total = total
        }

        function setWord(word) {
            state.word = word
        }

        return {
            setHive: setHive,
            setTotal: setTotal,
            setWord: setWord,
            onCheck: onCheck,
            onRotate: onRotate,
            onErase: onErase,
            onSolution: onSolution
        };
    }(document.getElementById('grid'));

    document.getElementById('check-button').onclick = Nocows.onCheck;
    document.getElementById('rotate-button').onclick = Nocows.onRotate;
    document.getElementById('erase-button').onclick = Nocows.onErase;
    document.getElementById('solution-button').onclick = Nocows.onSolution;
    document.getElementById('form').addEventListener('submit', (event) => {
        event.preventDefault();
        Nocows.setWord(document.getElementById('word').value)
        Nocows.onCheck()
        document.getElementById('word').focus()
    });
    document.getElementById('word').addEventListener('change', () => {
        Nocows.setWord(document.getElementById('word').value)
    });

    getHive(json => {
        // console.log(json);
        Nocows.setHive(json.hive);
        Nocows.setTotal(json.total);
    });
}

document.addEventListener('DOMContentLoaded', init);
