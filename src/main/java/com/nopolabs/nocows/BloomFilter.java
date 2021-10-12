package com.nopolabs.nocows;

import com.google.common.primitives.Bytes;

import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @link https://github.com/jasondavies/bloomfilter.js/blob/master/bloomfilter.js
 */
public class BloomFilter {

    public final int nBuckets;   // m/32
    private final int nBits;     // ceil(m/32)*32
    private final int nHash;     // k
    public final int[] buckets;

    public BloomFilter(int numBits, int numHash) {
        this.nBuckets = (int)Math.ceil(numBits/32.0);
        this.nBits = nBuckets * 32;
        this.nHash = numHash;
        this.buckets = new int[nBuckets];
    }

    public BloomFilter(int[] buckets, int numHash) {
        this.nBuckets = buckets.length;
        this.nBits = nBuckets * 32;
        this.nHash = numHash;
        this.buckets = buckets;
    }

//    public Bloomfilter(String hex, int numHash) {
//        this.nBuckets = buckets.length;
//        this.nBits = nBuckets * 32;
//        this.nHash = numHash;
//        this.buckets = buckets;
//    }

    public int getNBits() {
        return nBits;
    }

    public int getNHash() {
        return nHash;
    }

    public BloomFilter add(String value) {
        int[] l = locations(value);
        for (int i = 0; i < nHash; ++i) {
            int index = (int)Math.floor(Integer.divideUnsigned(l[i], 32));
            int bitShift = Integer.remainderUnsigned(l[i], 32);
            buckets[index] |= 1 << bitShift;
        }
        return this;
    }

    public boolean test(String value) {
        int[] l = locations(value);
        for (int i = 0; i < nHash; ++i) {
            int index = (int)Math.floor(Integer.divideUnsigned(l[i], 32));
            int bitShift = Integer.remainderUnsigned(l[i], 32);
            if ((buckets[index] & (1 << bitShift)) == 0) {
                return false;
            }
        }
        return true;
    }

    public String toHex() {
        List<Byte> byteList = Arrays.stream(buckets)
                .boxed()
                .flatMap(i -> Arrays.asList(
                        (byte)(i & 0xFF),
                        (byte)((i >>> 8) & 0xFF),
                        (byte)((i >>> 16) & 0xFF),
                        (byte)((i >>> 24) & 0xFF)).stream())
                .collect(Collectors.toList());

        byte[] bytes = Bytes.toArray(byteList);
        return Base64.getEncoder().encodeToString(bytes);
    }

    public BloomFilter fromHex(String b64) {
        byte[] bytes = Base64.getDecoder().decode(b64);
        for (int i = 0, b = 0; i < bytes.length; i += 4, b++) {
            buckets[b] = (bytes[i] & 0xFF)
                    | ((bytes[i+1] & 0xFF) << 8)
                    | ((bytes[i+2] & 0xFF) << 16)
                    | ((bytes[i+3] & 0xFF) << 24);
        }
        return this;
    }

    private int[] locations(String value) {
        int[] r = new int[nHash];
        int a = fnv1a(value, 0);
        int b = fnv1a(value, 1576284489);
        int x = a % nBits;
        for (int i = 0; i < nHash; ++i) {
            r[i] = x < 0 ? (x + nBits) : x;
            x = (x + b) % nBits; //Integer.remainderUnsigned((x + b), nBits);
        }
        return r;
    }

    private int fnv1a(String value, int seed) {
        int a = Integer.parseUnsignedInt("2166136261") ^ seed;
        for (int i = 0, n = value.length(); i < n; ++i) {
            int c = value.charAt(i);
            int d = c & 0xff00;
            if (d != 0) {
                a = fnvMultiply(a ^ d >>> 8);
            }
            a = fnvMultiply(a ^ c & 0xff);
        }
        return fnvMix(a);
    }

    // a * 16777619 mod 2**32
    private int fnvMultiply(int a) {
        long u = Integer.toUnsignedLong(a);
        return (int)(u + (u << 1) + (u << 4) + (u << 7) + (u << 8) + (u << 24));
    }

    // See https://web.archive.org/web/20131019013225/http://home.comcast.net/~bretm/hash/6.html
    private int fnvMix(int a) {
        a += a << 13;
        a ^= a >>> 7;
        a += a << 3;
        a ^= a >>> 17;
        a += a << 5;
        return a;
    }
}
