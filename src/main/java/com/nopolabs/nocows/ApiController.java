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

    private static final Logger LOG = LoggerFactory.getLogger(ApiController.class);
    private static final String SALT = "No cows secret sauce.";

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

    @GetMapping("/cows/{hive}")
    Cows hive(
            HttpServletRequest request,
            @PathVariable String hive,
            @RequestParam String proof) {

        checkProof(request, proof, hive);

        return bee.get(hive);
    }

    @GetMapping("/cows/{hive}/{word}")
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

        // proof pre-validated by ProofOfWorkFilter

        checkProof(request, proof, hive + ":" + word);

        return bee.get(hive, word);
    }

    private String getToken(HttpServletRequest request) {
        String ipAddress = getClientIpAddress(request);
        return createToken(ipAddress, epochSecond());
    }

    /**
     * @param ipAddress token is specific to the requester
     * @param epochSecond token is specific to the moment in time
     * @return hash(ipAddress:epochSecond:salt)
     */
    private String createToken(String ipAddress, long epochSecond) {
        return sha256(String.format("%s:%d:%s", ipAddress, epochSecond, SALT));
    }

    private String sha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
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
        LOG.info("proof = [" + proof + "]");

        // nonce:token:data
        String[] parts = proof.split(":", 3);
        if (parts.length != 3) {
            throw new IllegalArgumentException();
        }
        String token = parts[1];
        String data = parts[2];

        if (!data.equals(checkData)) {
            LOG.info(String.format("[%s] != [%s]", data, checkData));
            throw new IllegalArgumentException();
        }

        String ipAddress = getClientIpAddress(request);
        long epochSecond = epochSecond();

        // check the current second
        if (token.equals(createToken(ipAddress, epochSecond))) {
            return;
        }

        /// check the previous second
        if (token.equals(createToken(ipAddress, epochSecond - 1))) {
            return;
        }

        // token is too old
        LOG.info(String.format("ipAddress = %s", ipAddress));
        throw new IllegalArgumentException();
    }
}
