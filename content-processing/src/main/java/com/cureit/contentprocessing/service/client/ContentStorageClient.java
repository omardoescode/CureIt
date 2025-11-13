package com.cureit.contentprocessing.service.client;

import com.cureit.contentprocessing.dto.ContentSubmissionResponse;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentStorageClient {
    @Value("${content.storage.service.url}")
    private String contentStorageUrl;

    private final RestTemplate restTemplate;

    @PostConstruct
    public void init() {
        log.info("ContentStorageClient initialized with URL: {}", contentStorageUrl);
    }
    public void sendToStorage(Map<String, Object> contentData, String userId, String correlation) {
        log.info("[{}] Entered sendToStorage() with URL: {}", correlation, contentStorageUrl);
        String url = contentStorageUrl + "/api/create_submission";
        log.info("[{}] Sending content to Content Storage Service at {}", correlation, url);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("CureIt-User-Id", userId);
        headers.add("CureIt-Correlation-Id", correlation);

        try {
            log.info("[{}] Preparing request entity...", correlation);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(contentData, headers);

            log.info("[{}] Sending POST request...", correlation);
            ResponseEntity<ContentSubmissionResponse> response =
                    restTemplate.postForEntity(url, requestEntity, ContentSubmissionResponse.class);

            log.info("[{}] Response status: {}", correlation, response.getStatusCode());

            if (response.getStatusCode() == HttpStatus.CREATED) {
                String contentSlug = response.getBody().getContentSlug();
                log.info("[{}] Content successfully stored: {}", correlation, contentSlug);
            } else {
                log.error("[{}] Failed to store content, status: {}", correlation, response.getStatusCode());
                throw new RuntimeException("Failed to store content: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("[{}] Exception while sending to Content Storage: {}", correlation, e.getMessage(), e);
            throw new RuntimeException("Error communicating with Content Storage", e);
        }
    }
}
