package com.cureit.contentprocessing.util;

import com.vladsch.flexmark.html2md.converter.FlexmarkHtmlConverter;
import net.dankito.readability4j.Article;
import net.dankito.readability4j.Readability4J;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

@Component
public class ExtractData {

    public String extractMarkdown(Document doc) {
        Element article = doc.selectFirst("article");
        String htmlToConvert;

        if (article != null) {
            htmlToConvert = article.outerHtml();
        } else {
            // fallback when no <article> tag exists
            htmlToConvert = doc.body().html();
        }

        // clean HTML before converting
        Document cleaned = Jsoup.parse(htmlToConvert);
        cleaned.outputSettings().prettyPrint(false);

        cleaned.select("[style]").removeAttr("style");
        cleaned.select("span").unwrap();
        cleaned.select("div").unwrap();
        cleaned.select("iframe, video, audio, source, button, form").remove();
        cleaned.select("[data-testid=paywall], .paywall").remove();

        // convert to Markdown
        String rawMarkdown = FlexmarkHtmlConverter.builder()
                .build()
                .convert(cleaned.body().html());

        return cleanMarkdown(rawMarkdown);
    }

    private String cleanMarkdown(String markdown) {

        markdown = markdown.replaceAll("(?m)^=+$", ""); // remove ==
        markdown = markdown.replaceAll("\n{3,}", "\n\n"); // merge empty lines
        markdown = markdown.replaceAll("!\\[undefined\\]\\([^)]*\\)", ""); // remove undefined images
        markdown = markdown.replaceAll("(?m)^\\d{1,3}\\s*$", "");
        markdown = markdown.replaceAll("(?m)^\\s+$", "");
        markdown = markdown.replaceAll("\\[\\]\\([^)]*\\)", "");
        markdown = markdown.replaceAll("(?m)^(#+)([^#\\s])", "$1 $2");
        markdown = markdown.replaceAll("(?m)^\\|?(-+\\|)+-+$", "");
        markdown = markdown.replaceAll("(?m)^>\\s*>+", "> ");
        markdown = markdown
                .replaceAll("[ \\t]+$", "")   // trailing spaces
                .replaceAll("(?m)^\\s{1,3}\\n", "\n") // empty indented lines
                .trim();

        return markdown;
    }

    public String extractTitle(Document doc) {
        Element og = doc.selectFirst("meta[property=og:title]");
        if (og != null)
            return og.attr("content");

        Element tw = doc.selectFirst("meta[name=twitter:title]");
        if (tw != null)
            return tw.attr("content");

        if (doc.select("article").size() > 0)
            return extractUsingReadability(doc);

        return doc.title();
    }

    private String extractUsingReadability(Document doc) {
        Readability4J readability = new Readability4J(doc.baseUri(), doc.html());
        Article article = readability.parse();
        return article.getTitle();
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
