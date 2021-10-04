import { getHive, solve, check } from './api';
import { score, words, capitalize } from './bee';
import { shuffle } from './shuffle';
import { initGrid } from './grid';

const ROTATE_SYMBOL = String.fromCodePoint(0x1F504) // 🔄
const ERASE_SYMBOL = String.fromCodePoint(0x2B05)   // ⬅
const CHECK_SYMBOL = String.fromCodePoint(0x2705)   // ✅

const GRID_WIDTH = 4
const GRID_HEIGHT = 5

// 0,0   1,0   2,0   3,0
//    0,1   1,1   2,1   3,1
// 0,2   1,2   2,2   3,2
//    0,3   1,3   2,3   3,3
// 0,4   1,4   2,4   3,4
const HEX_VISIBLE_Y_X = [
    [0,0,0,0 ],
    [ 0,1,1,0],
    [0,1,1,1 ],
    [ 0,1,1,0],
    [0,0,0,0 ],
]

const TEXT_INDEX_Y_X = [
    [-1, -1, -1, -1  ],
    [  -1,  2,  3, -1],
    [-1,  1,  0,  4  ],
    [  -1,  6,  5, -1],
    [-1, -1, -1, -1  ],
]

function toHexVisible(x, y) {
    return HEX_VISIBLE_Y_X[y][x] === 1
}

function toTextIndex(x, y) {
    return TEXT_INDEX_Y_X[y][x]
}

function isRotate(x, y) {
    return (y === 0 && x === 2)
}

function isErase(x, y) {
    return (y === 3 && x === 0)
}

function isCheck(x, y) {
    return (y === 3 && x === 3)
}

class Observers {
    add(prop, observer) {
        if (!this.hasOwnProperty(prop)) {
            this[prop] = []
        }
        this[prop].push(observer)
    }

    notify(prop, value) {
        if (this.hasOwnProperty(prop)) {
            this[prop].forEach(observer => observer(value))
        }
    }
}

function init() {

    const state = new Proxy({
        hive: '',
        count: 0,
        total: 0,
        word: '',
        spelled: new Set(),
        solution: new Set(),
    }, {
        set: set
    })

    const observers = new Observers();
    observers.add('hive', drawHive)
    observers.add('word', drawHive)
    observers.add('count', updateCount)
    observers.add('total', updateTotal)
    observers.add('spelled', updateSpelled)
    observers.add('solution', updateSolution)

    function set(obj, prop, value) {
        obj[prop] = value;
        observers.notify(prop, value)
        return true // success!
    }

    const gridElement = document.getElementById('grid')

    const grid = initGrid(GRID_WIDTH, GRID_HEIGHT, gridElement, getText, isHexVisible)

    gridElement.addEventListener('click', (event) => {
        event.preventDefault();
        const { x, y } = grid.clickToHex(event)
        if (isRotate(x, y)) { rotateHive() }
        else if (isErase(x, y)) { eraseLast() }
        else if (isCheck(x, y)) { checkWord() }
        else {
            const index = toTextIndex(x, y)
            if (index >= 0) {
                addToWord(state.hive.charAt(index))
            }
        }
    })

    document.addEventListener('keydown', event => {
        if (event.isComposing || event.keyCode === 229) {
            return;
        }
        event.preventDefault();
        switch (event.key) {
            case 'Backspace': eraseLast(); break
            case 'Enter': checkWord(); break
            case 'Tab': rotateHive(); break
            case 'Escape': getSolution(); break
            default: {
                if (state.hive.includes(event.key)) {
                    addToWord(event.key)
                }
            }
        }
    })

    document.getElementById('solution-button').addEventListener('click', getSolution)

    function isHexVisible(x, y) {
        return toHexVisible(x, y)
    }

    function getText(x, y) {
        // console.log('getText', x, y)
        if (isRotate(x, y)) {
            return ROTATE_SYMBOL
        }
        if (isErase(x, y)) {
            return ERASE_SYMBOL
        }
        if (isCheck(x, y)) {
            return CHECK_SYMBOL
        }
        if (y === 4 && x === 2) {
            return state.word
        }
        const index = toTextIndex(x, y)
        return state.hive.charAt(index).toUpperCase()
    }

    function addToWord(char) {
        state.word = state.word + char
    }

    function drawHive() {
        // console.log('drawHive')
        grid.refresh()
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

    function updateSolution() {
        document.getElementById('solution').innerHTML = words(state.solution, state.hive)
        grid.refresh()
    }

    function getSolution() {
        solve(state.hive, json => {
            const solution = state.solution
            json.words.forEach(word => {
                solution.add(capitalize(word))
            })
            state.solution = solution
            state.word = ''
        })
    }

    function checkWord() {
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

    function eraseLast() {
        state.word = state.word.slice(0, -1)
    }

    function rotateHive() {
        const hive = state.hive
        state.hive = hive.charAt(0) + shuffle(hive.substring(1))
    }

    getHive(json => {
        // console.log(json)
        state.hive = json.hive
        state.total = json.total
    })
}

document.addEventListener('DOMContentLoaded', init)
