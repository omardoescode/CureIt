package com.cureit.contentprocessing.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ProcessContentResponse {
    private String contentSlug;
    private List <String> topics;
    private String type;
    private String extractedAt;
    private String sourceUrl;
    private String submittedAt;
    private String pageTitle;
    private String pageDescription;
    private String pageAuthor;

    private String title; // if article

    // if article or tweet
    private String author;
    @JsonIgnore
    private String markdown;
    private String markdownPreview;
}
