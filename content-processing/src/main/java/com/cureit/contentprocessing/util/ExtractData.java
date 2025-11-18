package com.cureit.contentprocessing.util;

import org.jsoup.nodes.Document;
import org.springframework.stereotype.Component;

@Component
public class ExtractData {
    public String extract(Document doc, String property, String fallbackTag) {
        String value = doc.select("meta[property=\"" + property + "\"]").attr("content");
        if (!value.isEmpty()) return value;

        value = doc.select("meta[name=\"" + property + "\"]").attr("content");
        if (!value.isEmpty()) return value;

        if (fallbackTag != null) {
            if (fallbackTag.equalsIgnoreCase("title")) {
                value = doc.title();
                if (!value.isEmpty()) return value;
            } else {
                value = doc.select(fallbackTag).text();
                if (!value.isEmpty()) return value;
            }
        }
        return null;
    }
    public String extractTitle(Document doc, String pageTitle) {
        String h1 = doc.select("h1").text();
        if (h1 != null && !h1.isBlank()) {
            return h1.trim();
        }
        return pageTitle;
    }

    public String extractAuthor(Document doc, String pageAuthor) {
        String[] selectors = {
                "[itemprop=author]",
                "[rel=author]",
                ".author",
                ".byline",
                ".post-author",
                ".article-author",
                ".writer",
                ".contributor"
        };

        for (String sel : selectors) {
            String result = doc.select(sel).text();
            if (result != null && !result.isBlank()) {
                return result.trim();
            }
        }

        return pageAuthor;
    }
}
