package com.cureit.contentprocessing.controller;

import com.cureit.contentprocessing.dto.ProcessContentRequest;
import com.cureit.contentprocessing.dto.ProcessContentResponse;
import com.cureit.contentprocessing.exception.MissingHeaderException;
import com.cureit.contentprocessing.service.ContentProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.*;


@RequiredArgsConstructor
@Slf4j
@RestController
@RequestMapping("/api")
public class ContentProcessingController {
	private final ContentProcessingService contentProcessingService;

	@PostMapping("/process")
	public ResponseEntity<ProcessContentResponse> submitContent(
			@RequestHeader(value = "CureIt-Coordination-Id", required = false) String coordination,
			@RequestBody ProcessContentRequest request) throws MissingRequestHeaderException {
		if (coordination == null)
			throw new MissingHeaderException("missing CureIt-Coordination-Id header");

		log.info("[{}] /process", coordination);
		ProcessContentResponse response = contentProcessingService.processContent(request, coordination);
		return ResponseEntity.ok(response);
	}
}
