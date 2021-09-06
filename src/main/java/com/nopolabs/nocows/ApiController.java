package com.nopolabs.nocows;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;

@RestController
@RequestMapping(value = "/api")
public class ApiController {

    private static Logger LOG = LoggerFactory.getLogger(ApiController.class);

    private final Bee bee;
    private final ProofOfWork proofOfWork;

    ApiController(
            Bee bee,
            ProofOfWork proofOfWork) {
        this.bee = bee;
        this.proofOfWork = proofOfWork;
    }

    @GetMapping("/token")
    String token(HttpServletRequest request) {

        return getToken(request);
    }

    @GetMapping("/headerToken")
    void token(HttpServletRequest request, HttpServletResponse response) {

        response.addHeader("nocows-token", getToken(request));
    }

    @GetMapping("/{hive}")
    Cows hive(@PathVariable String hive) {

        return bee.get(hive);
    }

    @GetMapping("/{hive}/{word}")
    Cows hive(
            HttpServletRequest request,
            @PathVariable String hive,
            @PathVariable String word,
            @RequestParam String proof) {

        if (!proofOfWork.validate(proof)) {
            throw new IllegalArgumentException();
        }

        checkProof(request, proof, hive + ":" + word);

        return bee.get(hive, word);
    }

    @GetMapping("/filter/{hive}/{word}")
    Cows checkHive(
            HttpServletRequest request,
            @PathVariable String hive,
            @PathVariable String word,
            @RequestParam String proof) {

        checkProof(request, proof, hive + ":" + word);

        return bee.get(hive, word);
    }

    private String getToken(HttpServletRequest request) {
        String ipAddress = getClientIpAddress(request);

        // token = hash(ipAddress + salt):epochSecond
        // this makes the token specific to the requester and a moment in time
        return sha256(salt(ipAddress)) + ":" + epochSecond();
    }

    private String salt(String data) {
        return data + "SeCrEt sAlT";
    }

    private String sha256(String data) {
        MessageDigest digest = null;
        try {
            digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return hex(hash);
        } catch (NoSuchAlgorithmException e) {
            return data; // :P
        }
    }

    private String hex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte aByte : bytes) {
            result.append(String.format("%02X", aByte));
        }
        return result.toString();
    }

    private long epochSecond() {
        return Instant.now().getEpochSecond();
    }

    private static final String[] CLIENT_IP_HEADERS = {
            "X-Forwarded-For",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "HTTP_VIA",
            "REMOTE_ADDR"
    };

    private String getClientIpAddress(HttpServletRequest request) {
        for (String header : CLIENT_IP_HEADERS) {
            String ip = request.getHeader(header);
            if (ip != null && ip.length() != 0 && !"unknown".equalsIgnoreCase(ip)) {
                return ip;
            }
        }

        return request.getRemoteAddr();
    }

    private void checkProof(HttpServletRequest request, String proof, String checkData) {
        if (proof == null) {
            throw new IllegalArgumentException();
        }

        // nonce:hash(ipAddress + salt):epochSecond:data
        String[] parts = proof.split(":", 4);
        if (parts.length != 4) {
            throw new IllegalArgumentException();
        }
        String hash = parts[1];
        long epochSecond = Long.parseLong(parts[2]);
        String data = parts[3];

        long elapsed = epochSecond() - epochSecond;
        if (elapsed != 0) { // less than one second
            throw new IllegalArgumentException();
        }

        if (!data.equals(checkData)) {
            throw new IllegalArgumentException();
        }

        String ipAddress = getClientIpAddress(request);
        if (!hash.equals(sha256(salt(ipAddress)))) {
            throw new IllegalArgumentException();
        }
    }
}
