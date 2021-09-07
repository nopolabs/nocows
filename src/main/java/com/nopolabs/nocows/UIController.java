package com.nopolabs.nocows;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Controller
@RequestMapping(value = "/")
public class UIController {

    private static final Logger LOG = LoggerFactory.getLogger(UIController.class);

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
        while(true) {
            String hive = pickVowels(2);
            hive = hive + pickLetters(5, hive);
            hive = shuffle(hive);
            Cows cows = bee.get(hive);
            if (hive.contains("q") && !hive.contains("u")) {
                continue;
            }
            if (cows.getWords().size() >= 20) {
                LOG.info("hive = " + hive + " " + cows.getWords().size() + " words");
                return hive;
            }
        }
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
