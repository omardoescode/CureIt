package com.cureit.contentprocessing.service;

import com.cureit.contentprocessing.dto.ArticleExtractionResponse;
import com.cureit.contentprocessing.util.UrlValidator;
import com.vladsch.flexmark.html2md.converter.FlexmarkHtmlConverter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArticleExtractionService {

    private final UrlValidator urlValidator;

    public ArticleExtractionResponse extract(String contentUrl) {
        log.info("Starting extraction for {}", contentUrl);
        urlValidator.validateOrThrow(contentUrl);

        try {
            Document doc = Jsoup.connect(contentUrl)
                    .timeout(7000)
                    .userAgent("Mozilla/5.0 (CureItBot/1.0)")
                    .get();

            doc.select("script, style, nav, header, footer, dialog, noscript").remove();

            String title = doc.title();
            String author = doc.select("meta[name=author]").attr("content");
            String bodyHtml = doc.body().html();
            String markdown = FlexmarkHtmlConverter.builder().build().convert(bodyHtml);

            Elements imgs = doc.select("img");
            for (Element img : imgs) {
                String imgUrl = img.absUrl("src");

                if (!imgUrl.isEmpty()) {
                    urlValidator.validateOrThrow(imgUrl);

                    if (!urlValidator.isValidImageUrl(imgUrl)) {
                        log.warn("Skipping unreachable or unsafe image: {}", imgUrl);
                        img.remove();
                    }
                }
            }

            return ArticleExtractionResponse.builder()
                    .title(title)
                    .author(author)
                    .markdown(markdown)
                    .sourceUrl(contentUrl)
                    .build();

        } catch (Exception e) {
            log.error("Failed to extract article: {}", e.getMessage());
            throw new RuntimeException("Extraction failed: " + e.getMessage(), e);
        }
    }
}
