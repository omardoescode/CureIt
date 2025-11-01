package com.cureit.contentprocessing.service;

import com.cureit.contentprocessing.dto.ArticleExtractionResponse;
import com.cureit.contentprocessing.dto.ContentSubmissionResponse;
import com.cureit.contentprocessing.dto.SubmitContentRequest;
import com.cureit.contentprocessing.util.UrlValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArticleProcessingService {

    private final UrlValidator urlValidator;
    private final ArticleExtractionService articleExtractionService;

    public ContentSubmissionResponse processArticle(SubmitContentRequest request, String userId, String coordinationId) {
        log.info("[{}] Received article submission from user {}", coordinationId, userId);

        urlValidator.validateOrThrow(request.getContentUrl());
        ArticleExtractionResponse extracted = articleExtractionService.extract(request.getContentUrl());
        log.info("[{}] Extracted title: {}", coordinationId, extracted.getTitle());

        String slug = UUID.randomUUID().toString();

        return ContentSubmissionResponse.builder()
                .contentSlug(slug)
                .build();
    }
}