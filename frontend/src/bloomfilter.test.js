import { BloomFilter } from './bloomfilter'

const N_BITS = 1600
const N_HASH = 5
const SERIALIZED = 'AAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAABAAAAAAAAAACAAAAAAAAAAAAAAABAAFAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAACAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAQAEAAAABABAAAgAAQAAAAAAAAAAAABAAAAAAAAAABAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAEAAAAAAAE='
const NAMES = ['nopolabs.com', 'noco.ws', 'phpinpractice.com', 'danrevel.com', 'qr8.us']

test('filter built in js', () => {
    const bloomFilter = new BloomFilter(N_BITS, N_HASH)
    NAMES.forEach(name => bloomFilter.add(name))
    NAMES.forEach(name => expect(bloomFilter.test(name)).toBe(true))
});

test('filter deserialized', () => {
    const bloomFilter = new BloomFilter(N_BITS, N_HASH)
    bloomFilter.fromBase64(SERIALIZED)
    NAMES.forEach(name => expect(bloomFilter.test(name)).toBe(true))
});

test('filter serialized matches deserialized', () => {
    const bloomFilter = new BloomFilter(N_BITS, N_HASH)
    NAMES.forEach(name => bloomFilter.add(name))
    bloomFilter.toBase64()
    expect(bloomFilter.toBase64()).toEqual(SERIALIZED)
});
