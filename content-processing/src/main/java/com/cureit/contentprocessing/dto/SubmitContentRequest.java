package com.cureit.contentprocessing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitContentRequest {
	@JsonProperty("content_url")
	private String contentUrl;
	private List<String> topics;
	@JsonProperty("private")
	private boolean isPrivate;
	@JsonProperty("submitted_at")
	private LocalDateTime submittedAt = LocalDateTime.now();
}
