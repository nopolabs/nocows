package com.nopolabs.nocows;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Controller
@RequestMapping(value = "/")
public class UIController {

    private final Bee bee;
    private final Random random;

    UIController(Bee bee) {
        this.bee = bee;
        this.random = new Random();
    }

    @GetMapping
    public String get(Model model) {

        String hive = pickHive();

        model.addAttribute("hive", hive);

        return "index";
    }

    private String pickHive() {
        String hive = "";
        while(hive.length() < 7) {
            hive = pickVowels(2);
            hive = hive + pickLetters(5, hive);
            if ((hive.contains("q") && !hive.contains("u"))
                    || bee.get(hive).getWords().size() < 30) {
                hive = "";
            }
        }
        return shuffle(hive);
    }

    public static String shuffle(String string) {
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
