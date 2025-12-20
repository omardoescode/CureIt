package com.cureit.interactionservice.service;

import org.springframework.http.ResponseEntity;

import com.cureit.interactionservice.dto.*;

public interface InteractionService {
	ResponseEntity<Void> modifyTopic(String coordinationId, ModifyTopicRequest request);

	ResponseEntity<Void> upvote(String coordinationId, VoteRequest request);

	ResponseEntity<Void> downvote(String coordinationId, VoteRequest request);

	ResponseEntity<Void> modifyType(String coordinationId, ModifyTypeRequest request);

	ResponseEntity<Void> followTopic(String coordinationId, String userId, FollowAndUnfollowRequest request);

	ResponseEntity<Void> unfollowTopic(String coordinationId, String userId, FollowAndUnfollowRequest request);
}
