package com.cureit.contentprocessing.service;

import com.cureit.contentprocessing.dto.ArticleExtractionResponse;
import com.cureit.contentprocessing.dto.ContentSubmissionResponse;
import com.cureit.contentprocessing.dto.SubmitContentRequest;
import com.cureit.contentprocessing.service.client.ContentStorageClient;
import com.cureit.contentprocessing.util.UrlValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArticleProcessingService {

    private final UrlValidator urlValidator;
    private final ArticleExtractionService articleExtractionService;
    private final ContentStorageClient contentStorageClient;

    public ContentSubmissionResponse processArticle(SubmitContentRequest request, String userId, String coordination) {
        log.info(">>> processArticle() called");
        log.info("[{}] Received article submission from user {}", coordination, userId);

        urlValidator.validateOrThrow(request.getContentUrl());
        ArticleExtractionResponse extracted = articleExtractionService.extract(request.getContentUrl());
        log.info("[{}] Extracted title: {}", coordination, extracted.getTitle());

        log.info("[{}] Before building contentData map", coordination);
        log.info("[{}] submittedAt: {}", coordination, request.getSubmittedAt());
        log.info("[{}] topics: {}", coordination, request.getTopics());

        Map<String, Object> contentData = Map.of(
                "topics", request.getTopics(),
                "title", extracted.getTitle(),
                "author", extracted.getAuthor(),
                "markdown", extracted.getMarkdown(),
                "is_private", request.isPrivate(),
                "type", "article",
                "extracted_at", Instant.now().toString(),
                "source_url", request.getContentUrl(),
                "submitted_at", request.getSubmittedAt().toString()
        );
        try {
            log.info("[{}] About to call sendToStorage()", coordination);
            String slug = contentStorageClient.sendToStorage(contentData, userId, coordination);
            log.info("[{}] Finished sendToStorage() successfully", coordination);

        return ContentSubmissionResponse.builder()
                .contentSlug(slug)
                .build();
        } catch (Exception e) {
            log.error("[{}] Error while sending to storage: {}", coordination, e.getMessage(), e);
            throw new ResponseStatusException(
                500,
                "Failed to store content in Content Storage Service",
                e
            );
        }
    }
}
