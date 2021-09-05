package com.nopolabs.nocows;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class ProofOfWork {

    public boolean validate(String proof) throws NoSuchAlgorithmException {
        if (proof == null) {
            return false;
        }

        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(proof.getBytes(StandardCharsets.UTF_8));

        // 12 bit partial collision
        return hash[0] == 0 && (hash[1] & 0xF0) == 0;
    }
}
