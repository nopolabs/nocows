function isPangram(word, hive) {
    if (word.length < 7) {
        return false
    }
    word = word.toLowerCase()
    for (var i = 0; i < hive.length; i++) {
        if (!word.includes(hive.charAt(i))) {
            return false
        }
    }
    return true
}

function score(words, hive) {
    return [...words].reduce(function(score, word){
        if (word.length < 4) {
            return score
        }
        if (word.length === 4) {
            return score + 1
        }
        if (isPangram(word, hive)) {
            return score + word.length + 7
        }
        return score + word.length
    }, 0)
}

function words(spelled, hive, separator = ' ') {
    return Array.from(spelled)
        .sort()
        .map(word => isPangram(word, hive) ? ("<b>" + word + "</b>") : word)
        .join(separator)
}

function capitalize(word) {
    word = word.toLowerCase().replace(/[^a-z]/gi, '') // for safety
    return word[0].toUpperCase() + word.substring(1).toLowerCase()
}

export { score, words, capitalize }
