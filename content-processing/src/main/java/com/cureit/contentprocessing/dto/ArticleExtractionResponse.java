package com.cureit.contentprocessing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleExtractionResponse {
    private String title;
    private String author;
    private String markdown;
    @JsonProperty("source_url")
    private String sourceUrl;
}