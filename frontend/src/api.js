import { prove } from './proof'

function getToken() {
    // console.log('getToken')
    return fetch('/api/token')
        .then(response => {
            if (!response.ok) { throw Error(response.statusText) }
            return response.text()
        })
}

function getProof(path, callApiWith) {
    // console.log('getProof', path)
    return getToken()
        .then(token => {
            const proof = prove(token + ':' + path)
            callApiWith(proof)
        })
}

function callApiWithProof(path, proof, handleJson) {
    // console.log('callApiWithProof', path, proof)
    const params = new URLSearchParams({ proof: proof })
    const url = '/api' + path + '?' + params
    fetch(url)
        .then(response => {
            if (!response.ok) { throw Error(response.statusText) }
            return response.json()
        })
        .then(json => { handleJson(json) })
        .catch(error => { console.log(error) })
}

function callApi(path, handleJson) {
    // console.log('callApi', path)
    getProof(path, proof => {
        callApiWithProof(path, proof, handleJson)
    })
}

const solve = function(hive, handleJson) {
    // console.log('solve', hive)
    const path = '/cows/' + hive
    callApi(path, handleJson)
}

const check = function(hive, word, handleJson) {
    // console.log('check', hive, word)
    const path = '/cows/' + hive.toLowerCase() + '/' + word.toLowerCase()
    callApi(path, handleJson)
}

const getHive = function(handleJson) {
    const path = '/hive'
    callApi(path, handleJson)
}

export { getHive, solve, check }
