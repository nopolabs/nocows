package com.nopolabs.nocows;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
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

        checkProof(request, proof, word);

        return bee.get(hive, word);
    }

    @GetMapping("/filter/{hive}/{word}")
    Cows checkHive(
            HttpServletRequest request,
            @PathVariable String hive,
            @PathVariable String word,
            @RequestParam String proof) {

        checkProof(request, proof, word);

        return bee.get(hive, word);
    }

    private String getToken(HttpServletRequest request) {
        return getClientIpAddress(request) + ":" + epochSecond();
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

    private void checkProof(HttpServletRequest request, String proof, String data) {
        if (proof == null) {
            throw new IllegalArgumentException();
        }

        // nonce:ipAddress:epochSecond:data
        String[] parts = proof.split(":");
        if (parts.length != 4) {
            throw new IllegalArgumentException();
        }

        String ipAddress = getClientIpAddress(request);
        if (!ipAddress.equals(parts[1])) {
            throw new IllegalArgumentException();
        }

        long elapsed = epochSecond() - Long.parseLong(parts[2]);
        if (elapsed < 0 || elapsed > 1) {
            throw new IllegalArgumentException();
        }

        if (!data.equals(parts[3])) {
            throw new IllegalArgumentException();
        }
    }
}
