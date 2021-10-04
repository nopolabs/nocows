import { createHash } from 'crypto'

function sha256(str) {
    return createHash('sha256')
        .update(str, 'utf8')
        .digest('hex')
}

const prove = function(data) {
    let nonce = 0
    while(true) {
        const candidate = nonce + ':' + data
        const hash = sha256(candidate)
        if (hash.startsWith('000')) {
            return candidate
        }
        nonce++
    }
}

export { prove }
