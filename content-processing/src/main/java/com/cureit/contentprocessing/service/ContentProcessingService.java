package com.cureit.contentprocessing.service;

import com.cureit.contentprocessing.dto.ProcessContentRequest;
import com.cureit.contentprocessing.dto.ProcessContentResponse;
import com.cureit.contentprocessing.util.ClassifyType;
import com.cureit.contentprocessing.util.ExtractData;
import com.cureit.contentprocessing.util.GenerateSlug;
import com.cureit.contentprocessing.util.UrlValidator;
import com.vladsch.flexmark.html2md.converter.FlexmarkHtmlConverter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentProcessingService {

    private final UrlValidator urlValidator;
    private final ClassifyType classifyType;
    private final GenerateSlug generateSlug;
    private final ExtractData extractData;

    public ProcessContentResponse processContent(ProcessContentRequest request, String coordination) {
        log.info("[{}] Received content processing request", coordination);

        String url = request.getContentUrl();

        // validate URL
        urlValidator.validateOrThrow(url);

        Document doc;

        try {
            doc = Jsoup.connect(url)
                    .timeout(7000)
                    .userAgent("Mozilla/5.0 (CureItBot/1.0)")
                    .get();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch content from URL: " + url, e);
        }

        doc.select("script, style, nav, header, footer, dialog, noscript").remove();

        String type = classifyType.determineType(url, doc).toString().toLowerCase();

        // extract metadata
        String pageTitle = extractData.extract(doc, "og:title", "title");
        String pageDescription = extractData.extract(doc, "og:description", null);
        String pageAuthor = extractData.extract(doc, "author", null);

//        String title = extractData.extractTitle(doc, pageTitle);
        String title = pageTitle;
        String author = extractData.extractAuthor(doc, pageAuthor);
        String markdown = FlexmarkHtmlConverter.builder().build().convert(doc.body().html());

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

        String slug = generateSlug.generate(pageTitle != null ? pageTitle : url);

        // extract topics -> will be changed
        List<String> topics = Collections.emptyList();

        Instant now = Instant.now();

        return ProcessContentResponse.builder()
                .contentSlug(slug)
                .topics(topics)
                .type(type)
                .extractedAt(now.toString())
                .submittedAt(now.toString())
                .sourceUrl(url)
                .pageTitle(pageTitle)
                .pageDescription(pageDescription)
                .pageAuthor(pageAuthor)
                .title(title)
                .author(author)
                .markdown(markdown)
                .build();
    }
}
