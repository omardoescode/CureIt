package com.cureit.contentprocessing.service;

import com.cureit.contentprocessing.dto.ArticleExtractionResponse;
import com.cureit.contentprocessing.dto.ContentSubmissionResponse;
import com.cureit.contentprocessing.dto.SubmitContentRequest;
import com.cureit.contentprocessing.service.client.ContentStorageClient;
import com.cureit.contentprocessing.util.UrlValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArticleProcessingService {

    private final UrlValidator urlValidator;
    private final ArticleExtractionService articleExtractionService;
    private final ContentStorageClient contentStorageClient;

    public ContentSubmissionResponse processArticle(SubmitContentRequest request, String userId, String correlation) {
        log.info(">>> processArticle() called");
        log.info("[{}] Received article submission from user {}", correlation, userId);

        urlValidator.validateOrThrow(request.getContentUrl());
        ArticleExtractionResponse extracted = articleExtractionService.extract(request.getContentUrl());
        log.info("[{}] Extracted title: {}", correlation, extracted.getTitle());

        String slug = UUID.randomUUID().toString();
        log.info("[{}] Before building contentData map", correlation);
        log.info("[{}] submittedAt: {}", correlation, request.getSubmittedAt());
        log.info("[{}] topics: {}", correlation, request.getTopics());

        Map<String, Object> contentData = Map.of(
                "content_slug", slug,
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
            log.info("[{}] About to call sendToStorage()", correlation);
            contentStorageClient.sendToStorage(contentData, userId, correlation);
            log.info("[{}] Finished sendToStorage() successfully", correlation);
        } catch (Exception e) {
            log.error("[{}] Error while sending to storage: {}", correlation, e.getMessage(), e);
        }

        return ContentSubmissionResponse.builder()
                .contentSlug(slug)
                .build();
    }
}
