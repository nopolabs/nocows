package com.nopolabs.nocows;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Random;

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
        while(true) {
            String hive = pickLetters(7);
            if (hive.contains("q") && !hive.contains("u")) {
                continue;
            }
            if (bee.get(hive).getWords().size() < 30) {
                continue;
            }
            return hive;
        }
    }

    private String pickLetters(int targetStringLength) {
        int leftLimit = 97; // letter 'a'
        int rightLimit = 122; // letter 'z'
        boolean[] selected = new boolean[26];
        return random.ints(leftLimit, rightLimit + 1)
                .filter(i -> {
                    int index = i - leftLimit;
                    if (selected[index]) {
                        return false;
                    }
                    selected[index] = true;
                    return true;
                })
                .limit(targetStringLength)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }
}
