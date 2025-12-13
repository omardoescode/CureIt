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
    public ResponseEntity<InteractionResponse> modifyTopic(
            @RequestHeader("CureIt-Coordination-Id") String coordinationId,
            @RequestBody @Valid ModifyTopicRequest request
    ) {
        checkCoordinationId(coordinationId);
        return ResponseEntity.ok(interactionService.modifyTopic(coordinationId, request));
    }

    @PostMapping("/upvote")
    public ResponseEntity<InteractionResponse> upvote(
            @RequestHeader("CureIt-Coordination-Id") String coordinationId,
            @RequestBody @Valid VoteRequest request
    ) {
        checkCoordinationId(coordinationId);
        return ResponseEntity.ok(interactionService.upvote(coordinationId, request));
    }

    @PostMapping("/downvote")
    public ResponseEntity<InteractionResponse> downvote(
            @RequestHeader("CureIt-Coordination-Id") String coordinationId,
            @RequestBody @Valid VoteRequest request
    ) {
        checkCoordinationId(coordinationId);
        return ResponseEntity.ok(interactionService.downvote(coordinationId, request));
    }

    @PostMapping("/type")
    public ResponseEntity<InteractionResponse> modifyType(
            @RequestHeader("CureIt-Coordination-Id") String coordinationId,
            @RequestBody @Valid ModifyTypeRequest request
    ) {
        checkCoordinationId(coordinationId);
        return ResponseEntity.ok(interactionService.modifyType(coordinationId, request));
    }

    @PostMapping("/follow")
    public ResponseEntity<InteractionResponse> followTopic(
            @RequestHeader("CureIt-Coordination-Id") String coordinationId,
            @RequestHeader("CureIt-User-Id") String userId,
            @RequestBody @Valid FollowAndUnfollowRequest request
    ) {
        checkCoordinationId(coordinationId);
        checkUserId(userId);
        return ResponseEntity.ok(interactionService.followTopic(coordinationId, userId, request));
    }

    @PostMapping("/unfollow")
    public ResponseEntity<InteractionResponse> unfollowTopic(
            @RequestHeader("CureIt-Coordination-Id") String coordinationId,
            @RequestHeader("CureIt-User-Id") String userId,
            @RequestBody @Valid FollowAndUnfollowRequest request
    ) {
        checkCoordinationId(coordinationId);
        checkUserId(userId);
        return ResponseEntity.ok(interactionService.unfollowTopic(coordinationId, userId, request));
    }


    private void checkCoordinationId(String coordinationId) {
        if (coordinationId == null)
            throw new MissingHeaderException(
                    "coordination id is missing",
                    "NO_COORDINATION_ID",
                    "missing CureIt-Coordination-Id header"
            );
    }

    private void checkUserId(String userId) {
        if (userId == null)
            throw new MissingHeaderException(
                    "user id is missing",
                    "NO_USER_ID",
                    "missing CureIt-User-Id header"
            );
    }
}
