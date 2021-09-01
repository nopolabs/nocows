package com.nopolabs.nocows;

import java.util.HashMap;
import java.util.Map;

class Node {

    private final Map<Character, Node> children = new HashMap<>();

    private boolean isWord;

    private int count = 0;

    int getCount() {
        return count;
    }

    boolean contains(String word) {
        Node parent = this;
        for (char letter : word.toCharArray()) {
            Node child = parent.children.get(letter);
            if (child == null) {
                return false;
            }
            parent = child;
        }
        return parent.isWord;
    }

    void add(String word) {
        Node node = this;
        for (char letter : word.toCharArray()) {
            node.count++;
            node = node.insert(letter);
        }
        node.isWord = true;
    }

    private Node insert(char letter) {
        return children.computeIfAbsent(letter, c -> new Node());
    }
}
