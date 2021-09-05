package com.nopolabs.nocows;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api")
public class ApiController {

    private final Bee bee;

    ApiController(Bee bee) {
        this.bee = bee;
    }

    @GetMapping("/{hive}")
    Cows hive(@PathVariable String hive) {

        return bee.get(hive);
    }

    @GetMapping("/check/{hive}/{word}")
    Cows hive(@PathVariable String hive, @PathVariable String word, @RequestParam String proof) {

        if (proof == null) {
            throw new IllegalArgumentException();
        }

        String[] parts = proof.split(":");
        if (parts.length != 2) {
            throw new IllegalArgumentException();
        }

        if (!word.equals(parts[1])) {
            throw new IllegalArgumentException();
        }

        return bee.get(hive, word);
    }
}
