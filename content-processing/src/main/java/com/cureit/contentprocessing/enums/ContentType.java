package com.cureit.contentprocessing.enums;

public enum ContentType {
	ARTICLE, VIDEO, OTHER;

	@Override
	public String toString() {
		return this.name().toLowerCase();
	}
}
