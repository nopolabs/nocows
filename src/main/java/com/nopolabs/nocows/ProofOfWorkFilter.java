package com.nopolabs.nocows;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;

@WebFilter("/api/*")
public class ProofOfWorkFilter implements Filter {

    private final ProofOfWork proofOfWork;

    public ProofOfWorkFilter() {
        this.proofOfWork = new ProofOfWork();
    }

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain) throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse rsp = (HttpServletResponse) response;

        String proof = req.getParameter("proof");

        try {
            if (proofOfWork.validate(proof)) {
                chain.doFilter(request, response);
            } else {
                rsp.sendError(HttpServletResponse.SC_FORBIDDEN);
            }
        } catch (NoSuchAlgorithmException e) {
            rsp.sendError(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
        }
    }
}
