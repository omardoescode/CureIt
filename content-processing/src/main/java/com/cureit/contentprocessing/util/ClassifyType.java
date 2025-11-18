package com.cureit.contentprocessing.util;

import com.cureit.contentprocessing.enums.ContentType;
import lombok.RequiredArgsConstructor;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@Component
public class ClassifyType {

    private static final Map<String, ContentType> DOMAIN_MAPPING = new HashMap<>();

    static {
        DOMAIN_MAPPING.put("twitter.com", ContentType.TWITTER);
        DOMAIN_MAPPING.put("x.com", ContentType.TWITTER);
        DOMAIN_MAPPING.put("spotify.com", ContentType.PODCAST);
        DOMAIN_MAPPING.put("coursera.org", ContentType.COURSE);
        DOMAIN_MAPPING.put("udemy.com", ContentType.COURSE);
        DOMAIN_MAPPING.put("amazon.com", ContentType.BOOK);
        DOMAIN_MAPPING.put("goodreads.com", ContentType.BOOK);
    }

    public ContentType determineType(String url, Document doc) {
        URI uri = URI.create(url);
        String host = uri.getHost().toLowerCase();

        for (Map.Entry<String, ContentType> entry : DOMAIN_MAPPING.entrySet()) {
            if (host.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        // fallback using og:type
        String ogType = doc.select("meta[property=og:type]").attr("content").toLowerCase();

        if (ogType.contains("playlist")) return ContentType.COURSE;
        if (ogType.contains("video")) return ContentType.VIDEO;
        if (ogType.contains("article")) return ContentType.ARTICLE;
        if (ogType.contains("book")) return ContentType.BOOK;

        // fallback using URL patterns
        if (url.toLowerCase().contains("playlist")) return ContentType.COURSE;
        return ContentType.OTHER;
    }
}