package com.cureit.contentprocessing.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class CoordinationIdFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(CoordinationIdFilter.class);
    private static final String HEADER_NAME = "CureIt-Coordination-Id";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;

        String coordinationId = httpRequest.getHeader(HEADER_NAME);

        if (coordinationId == null || coordinationId.isEmpty()) {
            coordinationId = UUID.randomUUID().toString();
            logger.info("Generated new coordination_id: {}", coordinationId);
        } else {
            logger.info("Received coordination_id: {}", coordinationId);
        }

        MDC.put("coordination_id", coordinationId);

        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
