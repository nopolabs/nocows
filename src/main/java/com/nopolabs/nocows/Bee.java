package com.nopolabs.nocows;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class Bee {

    private final Logger logger = LoggerFactory.getLogger(Bee.class);

    private final List<String> words;
    private final Node trie;

    public Bee(@Value("${words.resource}") String wordsResource) {
        words = Utils.getWordSource(wordsResource).collect(Collectors.toList());
        trie = Utils.getTrie(words);
        logger.info("Loaded {} words.", trie.getCount());
    }

    public Cows get(String hive) {
        List<String> found = words.stream()
                .filter(word -> inHive(hive, word))
                .collect(Collectors.toList());
        return new Cows(hive, found);
    }

    public Cows get(String hive, String candidate) {
        List<String> found = Stream.of(candidate)
                .filter(word -> inHive(hive, word))
                .filter(trie::contains)
                .collect(Collectors.toList());
        return new Cows(hive, found);
    }

    private boolean inHive(String hive, String word) {
        if (!word.contains(hive.substring(0, 1))) {
            return false;
        }
        for (char letter : word.toCharArray()) {
            if (!hive.contains(String.valueOf(letter))) {
                return false;
            }
        }
        return true;
    }
}
