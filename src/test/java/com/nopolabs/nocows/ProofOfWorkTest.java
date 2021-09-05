package com.nopolabs.nocows;

import org.junit.jupiter.api.Test;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class ProofOfWorkTest {

    @Test
    public void testValidate() throws NoSuchAlgorithmException, UnsupportedEncodingException {
        ProofOfWork proofOfWork = new ProofOfWork();

        String data = "{ data: 3.141592653, token: 12345678 }";
        String proof;
        int nonce = 0;
        do {
            String candidate = nonce + ":" + data;
            if (proofOfWork.validate(candidate)) {
                proof = candidate;
                break;
            }
            nonce++;
        } while (true);

        assertTrue(proofOfWork.validate(proof));

        System.out.println("proof=" + URLEncoder.encode(proof, StandardCharsets.UTF_8.toString()));
    }
}
