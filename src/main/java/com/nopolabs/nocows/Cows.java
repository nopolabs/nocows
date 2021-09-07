package com.nopolabs.nocows;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class Cows {

    private static final Logger LOG = LoggerFactory.getLogger(Cows.class);

    private final String hive;
    private final List<String> words;

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

    public boolean hasPangram() {
        return words.stream()
                .filter(word -> word.length() >= 7)
                .anyMatch(word -> {
                    for (String letter : word.split("")) {
                        if (!word.contains(letter)) {
                            return false;
                        }
                    }
                    LOG.info("hive = {}, pangram = {}", hive, word);
                    return true;
                });
    }
}
