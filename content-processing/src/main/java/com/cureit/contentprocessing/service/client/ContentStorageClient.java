package com.cureit.contentprocessing.service.client;

import com.cureit.contentprocessing.dto.ContentSubmissionResponse;
import com.cureit.contentprocessing.util.ContentStorageException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentStorageClient {
    @Value("${content.storage.service.url}")
    private String contentStorageUrl;

    private final WebClient webClient;

    public ContentStorageClient() {
        this.webClient = WebClient.builder()
                .baseUrl(contentStorageUrl)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
        log.info("ContentStorageClient initialized with WebClient at: {}", contentStorageUrl);
    }
    @PostConstruct
    public void init() {
        log.info("ContentStorageClient initialized with WebClient, URL: {}", contentStorageUrl);
    }
    public void sendToStorage(Map<String, Object> contentData, String userId, String coordination) {
        String url = "/api/create_submission";
        log.info("[{}] Sending content to Content Storage Service at {}", coordination, contentStorageUrl + url);

        try {
            // using Mono<ContentSubmissionResponse> to support future async conversion
            Mono<ContentSubmissionResponse> responseMono = webClient.post()
                    .uri(url)
                    .header("CureIt-User-Id", userId)
                    .header("CureIt-Coordination-Id", coordination)
                    .bodyValue(contentData)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse ->
                            clientResponse.bodyToMono(String.class).flatMap(errorBody -> {
                                log.error("[{}] Failed to store content. Status: {}, Body: {}", coordination, clientResponse.statusCode(), errorBody);
                                return Mono.error(new ContentStorageException(
                                        String.format("Failed to store content [coordinationId=%s]: status=%s, details=%s",
                                                coordination,
                                                clientResponse.statusCode(),
                                                errorBody
                                        )
                                ));
                            })
                    )
                    .bodyToMono(ContentSubmissionResponse.class);

            ContentSubmissionResponse response = responseMono.block(); // synchronous now

            if (response != null) {
                log.info("[{}] Content successfully stored with slug: {}", coordination, response.getContentSlug());
            } else {
                log.error("[{}] Empty response from Content Storage Service", coordination);
                throw new RuntimeException("Empty response from Content Storage Service");
            }

        } catch (WebClientResponseException e) {
            log.error("[{}] HTTP error while sending to storage: status={}, body={}", coordination, e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new RuntimeException("HTTP error while communicating with Content Storage", e);
        } catch (Exception e) {
            log.error("[{}] Exception while sending to Content Storage: {}", coordination, e.getMessage(), e);
            throw new RuntimeException("Error communicating with Content Storage", e);
        }
    }
}
