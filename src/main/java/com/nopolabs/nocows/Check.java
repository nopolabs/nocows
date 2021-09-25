package com.nopolabs.nocows;


public class Check {
    public final String hive;
    public final String word;
    public final boolean found;

    Check(String hive, String word, boolean found) {
        this.hive = hive;
        this.word = word;
        this.found = found;
    }
}
