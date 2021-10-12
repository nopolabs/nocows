package com.nopolabs.nocows;

import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BloomFilterTest {

    private static final int N_BITS = 1600;
    private static final int N_HASH = 5;
    private static final String SERIALIZED = "AAAAAAAAAAAAAAAAABAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAABAAAAAAAAAACAAAAAAAAAAAAAAABAAFAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAACAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAQAEAAAABABAAAgAAQAAAAAAAAAAAABAAAAAAAAAABAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAEAAAAAAAE=";
    private static final List<String> NAMES = Arrays.asList(
            "nopolabs.com", "noco.ws", "phpinpractice.com", "danrevel.com", "qr8.us"
    );

    @Test
    public void test_built_in_java() {
        BloomFilter bloomFilter = new BloomFilter(N_BITS, N_HASH);
        NAMES.forEach(bloomFilter::add);
        String hex = bloomFilter.toHex();
        NAMES.forEach(name -> assertTrue(bloomFilter.test(name)));
    }

    @Test
    public void test_deserialized() {
        BloomFilter bloomFilter = new BloomFilter(N_BITS, N_HASH);
        bloomFilter.fromHex(SERIALIZED);
        NAMES.forEach(name -> assertTrue(bloomFilter.test(name)));
    }

    @Test
    public void test_serialized_matches_deserialized() {
        BloomFilter bloomFilter = new BloomFilter(N_BITS, N_HASH);
        NAMES.forEach(bloomFilter::add);
        String hex = bloomFilter.toHex();
        assertEquals(SERIALIZED, hex);
    }
}