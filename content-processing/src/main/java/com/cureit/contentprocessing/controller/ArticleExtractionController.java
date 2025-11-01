package com.cureit.contentprocessing.controller;

import com.cureit.contentprocessing.dto.ContentSubmissionResponse;
import com.cureit.contentprocessing.dto.SubmitContentRequest;
import com.cureit.contentprocessing.service.ArticleProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@Slf4j
@RestController
@RequestMapping("/api")
public class ArticleExtractionController {
    private final ArticleProcessingService articleProcessingService;
    @PostMapping("/submit_content")
    public ResponseEntity<ContentSubmissionResponse> submitContent(@RequestHeader("CureIt-User-Id") String userId,
                                                                   @RequestHeader("CureIt-Coordination-Id") String coordinationId,
                                                                   @RequestBody SubmitContentRequest request) {
        log.info("[{}] /submit_content called by {}", coordinationId, userId);
        var response = articleProcessingService.processArticle(request, userId, coordinationId);
        return ResponseEntity.ok(response);
    }
}
