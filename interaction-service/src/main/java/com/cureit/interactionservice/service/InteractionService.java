package com.cureit.interactionservice.service;

import com.cureit.interactionservice.dto.*;

public interface InteractionService {
    InteractionResponse modifyTopic(String coordinationId, ModifyTopicRequest request);

    InteractionResponse upvote(String coordinationId, VoteRequest request);

    InteractionResponse downvote(String coordinationId, VoteRequest request);

    InteractionResponse modifyType(String coordinationId, ModifyTypeRequest request);

    InteractionResponse followTopic(String coordinationId, String userId, FollowAndUnfollowRequest request);

    InteractionResponse unfollowTopic(String coordinationId, String userId, FollowAndUnfollowRequest request);
}