import 'core-js/stable';
import 'regenerator-runtime/runtime';

const crypto = window.crypto.subtle;

// SHA-256 hash of str, returns Uint8Array
const sha256 = function(str) {
    var buffer = new TextEncoder('utf-8').encode(str)
    return crypto.digest('SHA-256', buffer);
}

const prove = async function(data) {
    let nonce = 0;
    while(true) {
        const candidate = nonce + ':' + data;
        const hash = await sha256(candidate);
        const view = new DataView(hash);
        const value = view.getUint16(0) & 0xFFF0; // first 12 bits
        if (value === 0) {
            return candidate;
        }
        nonce++
    }
}

export { prove };
