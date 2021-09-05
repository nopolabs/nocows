package com.nopolabs.nocows;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping(value = "/api")
public class ApiController {

    private final Bee bee;
    private final ProofOfWork proofOfWork;

    ApiController(
            Bee bee,
            ProofOfWork proofOfWork) {
        this.bee = bee;
        this.proofOfWork = proofOfWork;
    }

    @GetMapping("/token")
    long token() {

        return Instant.now().getEpochSecond();
    }

    @GetMapping("/{hive}")
    Cows hive(@PathVariable String hive) {

        return bee.get(hive);
    }

    @GetMapping("/{hive}/{word}")
    Cows hive(@PathVariable String hive, @PathVariable String word, @RequestParam String proof) {

        if (!proofOfWork.validate(proof)) {
            throw new IllegalArgumentException();
        }

        checkProof(proof, word);

        return bee.get(hive, word);
    }

    @GetMapping("/filter/{hive}/{word}")
    Cows checkHive(@PathVariable String hive, @PathVariable String word, @RequestParam String proof) {

        checkProof(proof, word);

        return bee.get(hive, word);
    }

    private void checkProof(String proof, String word) {
        if (proof == null) {
            throw new IllegalArgumentException();
        }

        String[] parts = proof.split(":");
        if (parts.length != 3) {
            throw new IllegalArgumentException();
        }

        long elapsed = token() - Long.parseLong(parts[1]);
        if (elapsed < 0 || elapsed > 1) {
            throw new IllegalArgumentException();
        }

        if (!word.equals(parts[2])) {
            throw new IllegalArgumentException();
        }
    }
}
