package com.cureit.contentprocessing.util;

import com.cureit.contentprocessing.enums.ContentType;
import lombok.RequiredArgsConstructor;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class ClassifyType {

	public ContentType classify(Document doc, String url) {

		ContentType fromDomain = classifyFromKnownDomain(url);
		if (fromDomain != null)
			return fromDomain;

		ContentType fromOg = classifyFromOpenGraph(doc);
		if (fromOg != null)
			return fromOg;

		ContentType fromTwitter = classifyFromTwitterCard(doc);
		if (fromTwitter != null)
			return fromTwitter;

		if (hasArticleTag(doc))
			return ContentType.ARTICLE;

		ContentType fromUrl = classifyFromUrlHeuristics(url);
		if (fromUrl != null)
			return fromUrl;

		return ContentType.OTHER;
	}

	// known domain logic
	private static ContentType classifyFromKnownDomain(String url) {
		if (url == null)
			return null;

		if (url.contains("youtube.com") || url.contains("youtu.be")) {
			return ContentType.VIDEO;
		}

		if (url.contains("medium.com")) {
			return ContentType.ARTICLE;
		}

		// add more domains if needed

		return null;
	}

	// OpenGraph
	private static ContentType classifyFromOpenGraph(Document doc) {
		if (doc == null)
			return null;

		String ogType = doc.select("meta[property=og:type]").attr("content");

		if (ogType == null || ogType.isEmpty())
			return null;

		switch (ogType.toLowerCase()) {
		case "article":
			return ContentType.ARTICLE;
		case "video":
		case "video.movie":
		case "video.episode":
			return ContentType.VIDEO;
		}
		return null;
	}

	// twitter card
	private static ContentType classifyFromTwitterCard(Document doc) {
		if (doc == null)
			return null;

		String card = doc.select("meta[name=twitter:card]").attr("content");

		if (card == null || card.isEmpty())
			return null;

		switch (card.toLowerCase()) {
		case "player":
			return ContentType.VIDEO;
		}

		return null;
	}

	// article tag
	private static boolean hasArticleTag(Document doc) {
		return doc.select("article").size() > 0;
	}

	// URL heuristics
	private static ContentType classifyFromUrlHeuristics(String url) {
		if (url == null)
			return null;

		String lower = url.toLowerCase();

		if (lower.contains("/post/") || lower.contains("/article/") || lower.contains("/blog/")) {
			return ContentType.ARTICLE;
		}

		if (lower.contains("/watch/") || lower.contains("/video/")) {
			return ContentType.VIDEO;
		}

		return null;
	}
}
