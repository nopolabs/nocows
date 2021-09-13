package com.nopolabs.nocows;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class Bee {

    private static final Logger LOG = LoggerFactory.getLogger(Bee.class);

    private final Random random;
    private final List<String> words;
    private final Node trie;

    public Bee(@Value("${words.resource}") String wordsResource) {
        this.random = new Random();
        this.words = Utils.getWordSource(wordsResource).collect(Collectors.toList());
        this.trie = Utils.getTrie(this.words);
        LOG.info("Loaded {} words.", trie.getCount());
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

    public String getHive() {
        while(true) {
            String hive = pickVowels(2);
            hive = hive + pickLetters(5, hive);
            hive = shuffle(hive);
            Cows cows = get(hive);
            if (hive.contains("q") && !hive.contains("u")) {
                continue;
            }
            if (cows.getWords().size() < 20) {
                continue;
            }
            if (!cows.hasPangram()) {
                continue;
            }
            if (!cows.eachLetterHasAWord()) {
                continue;
            }

            return hive;
        }
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

    private String shuffle(String string) {
        List<String> letters = Arrays.asList(string.split(""));
        Collections.shuffle(letters);
        return String.join("", letters);
    }

    private String pickLetters(int count, String excluding) {
        return pickChars(count, "abcdefghijklmnopqrstuvwxyz", excluding);
    }

    private String pickVowels(int count) {
        return pickChars(count, "aeiou", "");
    }

    private String pickChars(int count, String source, String excluding) {
        boolean[] selected = new boolean[source.length()];
        excluding.chars().forEach(c -> selected[c-'a'] = true);
        return random.ints(0, source.length())
                .filter(index -> {
                    if (selected[index]) {
                        return false;
                    }
                    selected[index] = true;
                    return true;
                })
                .limit(count)
                .map(source::charAt)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }
}
