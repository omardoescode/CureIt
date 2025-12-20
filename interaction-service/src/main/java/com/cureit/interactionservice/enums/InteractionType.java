package com.cureit.interactionservice.enums;

import lombok.Getter;

@Getter
public enum InteractionType {
	MODIFY_TOPIC("modify_topic"), UPVOTE("upvote"), DOWNVOTE("downvote"), MODIFY_TYPE("modify_type"),
	FOLLOW_TOPIC("follow_topic"), UNFOLLOW_TOPIC("unfollow_topic");

	private final String value;

	InteractionType(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}
}
