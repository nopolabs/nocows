package com.nopolabs.nocows;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Controller {

    private final Bee bee;

    Controller(Bee bee) {
        this.bee = bee;
    }

    @GetMapping("/{hive}")
    Cows hive(@PathVariable String hive) {

        return bee.get(hive);
    }

    @GetMapping("/{hive}/{word}")
    Cows hive(@PathVariable String hive, @PathVariable String word) {

        return bee.get(hive, word);
    }
}
