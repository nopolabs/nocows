import { getHive, solve, check } from './api';
import { score, words, capitalize } from './bee';
import { shuffle } from './shuffle';
import { initGrid } from './grid';

//  0,0   1,0   2,0
//     0,1   1,1   2,1
//  0,2   1,2   2,2
//     0,3   1,3   2,3
//  0,4   1,4   2,4
const HEX_VISIBLE_Y_X = [
    [ 0,  0,  0],
    [ 1,  1,  0],
    [ 1,  1,  1],
    [ 1,  1,  0],
    [ 0,  0,  0],
]

function toHexVisible(x, y) {
    return HEX_VISIBLE_Y_X[y][x] === 1
}

const TEXT_INDEX_Y_X = [
    [-1, -1, -1],
    [ 2,  3, -1],
    [ 1,  0,  4],
    [ 6,  5, -1],
    [-1, -1, -1],
]

function toTextIndex(x, y) {
    return TEXT_INDEX_Y_X[y][x]
}

function init() {

    const Nocows = function (gridElement) {

        const handler = {
            set: function(obj, prop, value) {
                // console.log('set', prop, value)
                obj[prop] = value;
                switch (prop) {
                    case 'hive':
                    case 'word':
                        drawHive()
                        break
                    case 'count':
                        updateCount(value)
                        break
                    case 'total':
                        updateTotal(value);
                        break
                    case 'spelled':
                        updateSpelled(value)
                        break
                }
                return true // success!
            },
        }

        const state = new Proxy({
            hive: '',
            count: 0,
            total: 0,
            word: '',
            spelled: new Set(),
        }, handler)

        const grid = initGrid(gridElement, clickIndex, getText, isHexVisible)

        function isHexVisible(x, y) {
            return toHexVisible(x, y)
        }

        function getText(x, y) {
            // console.log('getText', x, y)
            if (y === 0) {
                switch (x) {
                    case 1: return state.word
                    default: return ''
                }
            }
            if (y === 4) {
                switch (x) {
                    case 0: return String.fromCodePoint(0x2B05)  // ⬅
                    case 1: return String.fromCodePoint(0x1F504) // 🔄
                    case 2: return String.fromCodePoint(0x2705)  // ✅
                    default: return ''
                }
            }
            const index = toTextIndex(x, y)
            return state.hive.charAt(index).toUpperCase()
        }

        function clickIndex(x, y) {
            if (y === 0) {
                return
            }
            if (y === 4) {
                switch (x) {
                    case 0: return onErase()  // ⬅
                    case 1: return onRotate() // 🔄
                    case 2: return onCheck()  // ✅
                    default: return ''
                }
            }
            const index = toTextIndex(x, y)
            state.word = state.word + state.hive.charAt(index)
        }

        function drawHive() {
            grid.draw(state.hive)
        }

        function updateCount(value) {
            // console.log('updateCount', value, state.count)
            document.getElementById('count').innerText = value
        }

        function updateTotal(value) {
            // console.log('updateTotal', value, state.total)
            document.getElementById('total').innerText = value
        }

        function updateSpelled(value) {
            // console.log('updateSpelled', value, state.spelled)
            document.getElementById('score').innerText = score(value, state.hive)
            document.getElementById('words').innerHTML = words(value, state.hive)
            state.count = value.size
        }

        function onSolution() {
            solve(state.hive, json => {
                const spelled = state.spelled
                json.words.forEach(word => {
                    spelled.add(capitalize(word))
                })
                state.spelled = spelled
                state.word = ''
            })
        }

        function onCheck() {
            if (state.word.length > 0) {
                check(state.hive, state.word, json => {
                    const spelled = state.spelled
                    if (json.found) {
                        spelled.add(capitalize(json.word))
                        state.spelled = spelled
                    }
                    state.word = ''
                })
            }
        }

        function onErase() {
            state.word = state.word.slice(0, -1)
        }

        function onRotate() {
            const hive = state.hive
            state.hive = hive.charAt(0) + shuffle(hive.substring(1))
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
            onSolution: onSolution
        }
    }(document.getElementById('grid'))

    document.getElementById('solution-button').onclick = Nocows.onSolution

    getHive(json => {
        // console.log(json)
        Nocows.setHive(json.hive)
        Nocows.setTotal(json.total)
    })
}

document.addEventListener('DOMContentLoaded', init)
