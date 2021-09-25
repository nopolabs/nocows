package com.nopolabs.nocows;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class Solution {

    private static final Logger LOG = LoggerFactory.getLogger(Solution.class);

    private final String hive;
    private final List<String> words;

    Solution(String hive, List<String> words) {
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
                    for (String letter : hive.split("")) {
                        if (!word.contains(letter)) {
                            return false;
                        }
                    }
                    LOG.info("hive = {}, pangram = {}", hive, word);
                    return true;
                });
    }

    public boolean eachLetterHasAWord() {
        for (String letter : hive.split("")) {
            if (words.stream().noneMatch(word -> word.contains(letter))) {
                LOG.info("hive = {} has no words for {}", hive, letter);
                return false; // no words for this letter
            }
        }
        return true;
    }
}
