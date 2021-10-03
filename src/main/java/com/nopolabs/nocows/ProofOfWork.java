package com.nopolabs.nocows;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Component
public class ProofOfWork {

    private static final Logger LOG = LoggerFactory.getLogger(ProofOfWork.class);

    public boolean validate(String proof) {
        if (proof == null) {
            return false;
        }

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(proof.getBytes(StandardCharsets.UTF_8));

            // 12 bit partial collision
            byte firstEightBits = hash[0];
            byte nextFourBits = (byte)(hash[1] & 0xF0);
            return firstEightBits == 0 && nextFourBits == 0;
        } catch (NoSuchAlgorithmException e) {
            return false;
        }
    }
}
