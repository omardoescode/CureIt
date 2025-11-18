package com.cureit.contentprocessing.controller;

import com.cureit.contentprocessing.dto.ProcessContentRequest;
import com.cureit.contentprocessing.dto.ProcessContentResponse;
import com.cureit.contentprocessing.service.ContentProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@Slf4j
@RestController
@RequestMapping("/api")
public class ContentProcessingController {
    private final ContentProcessingService contentProcessingService;
    @PostMapping("/process")
    public ResponseEntity<ProcessContentResponse> submitContent(@RequestHeader("CureIt-Coordination-Id") String coordination,
                                                                @RequestBody ProcessContentRequest request) {
        log.info("[{}] /process", coordination);
        var response = contentProcessingService.processContent(request, coordination);
        return ResponseEntity.ok(response);
    }
}
