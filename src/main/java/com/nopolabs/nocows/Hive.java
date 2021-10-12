package com.nopolabs.nocows;

public class Hive {
    public final String hive;
    public final int total;
    public final int nBits;
    public final int nHash;
    public final String bloomFilter;

    Hive(String hive, int total, BloomFilter bloomFilter) {
        this.hive = hive;
        this.total = total;
        this.nBits = bloomFilter.getNBits();
        this.nHash = bloomFilter.getNHash();
        this.bloomFilter = bloomFilter.toHex();
    }
}
