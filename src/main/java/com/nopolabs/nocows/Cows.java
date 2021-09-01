package com.nopolabs.nocows;

import java.util.List;

public class Cows {
    private final String hive;
    private final List<String> words;

    Cows(String hive, String word) {
        this(hive, List.of(word));
    }

    Cows(String hive, List<String> words) {
        this.hive = hive;
        this.words = words;
    }

    public String getHive() {
        return hive;
    }

    public List<String> getWords() {
        return words;
    }
}
