package com.cureit.interactionservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tools.jackson.databind.PropertyNamingStrategies;
import tools.jackson.databind.annotation.JsonNaming;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ModifyTypeRequest {
	@NotBlank
	private String contentType;
	private Integer userWeight = 1;
	@NotBlank
	private String contentId;
	@NotNull
	private Boolean remove;

	public Integer getUserWeight() {
		int weight = userWeight != null ? userWeight : 1;
		return (remove ? -1 : 1) * weight;
	}
}
