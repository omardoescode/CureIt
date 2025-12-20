package com.cureit.interactionservice.controller;

import com.cureit.interactionservice.dto.*;
import com.cureit.interactionservice.exception.MissingHeaderException;
import com.cureit.interactionservice.service.InteractionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InteractionController {

	private final InteractionService interactionService;

	@PostMapping("/topic")
	public ResponseEntity<Void> modifyTopic(@RequestHeader("CureIt-Coordination-Id") String coordinationId,
			@RequestBody @Valid ModifyTopicRequest request) {
		checkCoordinationId(coordinationId);
		return interactionService.modifyTopic(coordinationId, request);
	}

	@PostMapping("/upvote")
	public ResponseEntity<Void> upvote(@RequestHeader("CureIt-Coordination-Id") String coordinationId,
			@RequestBody @Valid VoteRequest request) {
		checkCoordinationId(coordinationId);
		return interactionService.upvote(coordinationId, request);
	}

	@PostMapping("/downvote")
	public ResponseEntity<Void> downvote(@RequestHeader("CureIt-Coordination-Id") String coordinationId,
			@RequestBody @Valid VoteRequest request) {
		checkCoordinationId(coordinationId);
		return interactionService.downvote(coordinationId, request);
	}

	@PostMapping("/type")
	public ResponseEntity<Void> modifyType(@RequestHeader("CureIt-Coordination-Id") String coordinationId,
			@RequestBody @Valid ModifyTypeRequest request) {
		checkCoordinationId(coordinationId);
		return interactionService.modifyType(coordinationId, request);
	}

	@PostMapping("/follow")
	public ResponseEntity<Void> followTopic(@RequestHeader("CureIt-Coordination-Id") String coordinationId,
			@RequestHeader("CureIt-User-Id") String userId, @RequestBody @Valid FollowAndUnfollowRequest request) {
		checkCoordinationId(coordinationId);
		checkUserId(userId);
		return interactionService.followTopic(coordinationId, userId, request);
	}

	@PostMapping("/unfollow")
	public ResponseEntity<Void> unfollowTopic(@RequestHeader("CureIt-Coordination-Id") String coordinationId,
			@RequestHeader("CureIt-User-Id") String userId, @RequestBody @Valid FollowAndUnfollowRequest request) {
		checkCoordinationId(coordinationId);
		checkUserId(userId);
		return interactionService.unfollowTopic(coordinationId, userId, request);
	}

	private void checkCoordinationId(String coordinationId) {
		if (coordinationId == null)
			throw new MissingHeaderException("coordination id is missing", "NO_COORDINATION_ID",
					"missing CureIt-Coordination-Id header");
	}

	private void checkUserId(String userId) {
		if (userId == null)
			throw new MissingHeaderException("user id is missing", "NO_USER_ID", "missing CureIt-User-Id header");
	}
}
