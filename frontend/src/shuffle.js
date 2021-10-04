function random(i, n) {
    return Math.floor(Math.random() * (n - i) + i)
}

function shuffle(string) {
    let array = [...string]

    array.forEach(
        (elem, i, arr, j = random(i, arr.length)) => {
            [arr[i], arr[j]] = [arr[j], arr[i]]
        }
    )

    return array.join('')
}

export { shuffle }
