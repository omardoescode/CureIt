package com.cureit.interactionservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document(collection = "interaction_events")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InteractionEvent {

	@Id
	private String id;

	private String type;
	private Instant timestamp;

	private String userId;
	private String contentId;
	private String topic;
	private String contentType;
	private Integer userWeight;

	private Map<String, Object> rawData;
}
