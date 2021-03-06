package com.nopolabs.nocows;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

public class Utils {

    public static Node getTrie(List<String> words) {
        Node trie = new Node();
        words.stream()
                .map(String::toLowerCase)
                .forEach(trie::add);

        return trie;
    }

    public static Stream<String> getWordSource(String... names) {
        return Arrays.stream(names)
                .flatMap(Utils::resourceLines)
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> s.matches("[a-z]{4,}"))
                .sorted()
                .distinct();
    }

    public static Stream<String> resourceLines(String resourceName) {
        InputStream inputStream = Utils.class.getResourceAsStream(resourceName);
        InputStreamReader inputStreamReader = new InputStreamReader(Objects.requireNonNull(inputStream));
        BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
        return bufferedReader.lines();
    }
}
