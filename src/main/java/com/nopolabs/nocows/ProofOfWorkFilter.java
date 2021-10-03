package com.nopolabs.nocows;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebFilter("/api/filter/*")
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

        if (proofOfWork.validate(proof)) {
            chain.doFilter(request, response);
        } else {
            rsp.sendError(HttpServletResponse.SC_FORBIDDEN);
        }
    }
}
