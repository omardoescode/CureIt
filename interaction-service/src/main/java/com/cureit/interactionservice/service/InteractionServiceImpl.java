package com.cureit.interactionservice.service;

import com.cureit.interactionservice.dto.*;
import com.cureit.interactionservice.entity.InteractionEvent;
import com.cureit.interactionservice.enums.InteractionType;
import com.cureit.interactionservice.repository.InteractionEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InteractionServiceImpl implements InteractionService {

    private final InteractionEventRepository repository;
    private final EventProducer eventProducer;

    @Override
    public InteractionResponse modifyTopic(String coordinationId, ModifyTopicRequest request) {
        loggerHelper(coordinationId);

        InteractionEvent event = InteractionEvent.builder()
                .type(InteractionType.MODIFY_TOPIC.getValue())
                .timestamp(Instant.now())
                .contentId(request.getContentId())
                .topic(request.getTopic())
                .userWeight(request.getUserWeight())
                .rawData(Map.of(
                        "content_id", request.getContentId(),
                        "topic", request.getTopic(),
                        "user_weight", request.getUserWeight()
                ))
                .build();

        return saveAndPublish(event);
    }

    @Override
    public InteractionResponse upvote(String coordinationId, VoteRequest request) {

        loggerHelper(coordinationId);

        int weight = (request.getUserWeight() != null) ? request.getUserWeight() : 1;

        InteractionEvent event = InteractionEvent.builder()
                .type(InteractionType.VOTE.getValue())
                .userWeight(-1)
                .timestamp(Instant.now())
                .contentId(request.getContentId())
                .userWeight(weight)
                .rawData(Map.of(
                        "content_id", request.getContentId(),
                        "user_weight", weight
                ))
                .build();

        return saveAndPublish(event);
    }

    @Override
    public InteractionResponse downvote(String coordinationId, VoteRequest request) {
        loggerHelper(coordinationId);

        int weight = (request.getUserWeight() != null) ? request.getUserWeight() : -1;

        InteractionEvent event = InteractionEvent.builder()
                .type(InteractionType.VOTE.getValue())
                .userWeight(-1)
                .timestamp(Instant.now())
                .contentId(request.getContentId())
                .userWeight(weight)
                .rawData(Map.of(
                        "content_id", request.getContentId(),
                        "user_weight", weight
                ))
                .build();

        return saveAndPublish(event);
    }

    @Override
    public InteractionResponse modifyType(String coordinationId, ModifyTypeRequest request) {
        loggerHelper(coordinationId);

        InteractionEvent event = InteractionEvent.builder()
                .type(InteractionType.MODIFY_TYPE.getValue())
                .timestamp(Instant.now())
                .contentId(request.getContentId())
                .contentType(request.getContentType())
                .userWeight(request.getUserWeight())
                .rawData(Map.of(
                        "content_id", request.getContentId(),
                        "content_type", request.getContentType(),
                        "user_weight", request.getUserWeight()
                ))
                .build();

        return saveAndPublish(event);
    }

    @Override
    public InteractionResponse followTopic(String coordinationId, String userId, FollowAndUnfollowRequest request) {
        loggerHelper(coordinationId, userId);

        InteractionEvent event = InteractionEvent.builder()
                .type(InteractionType.FOLLOW_TOPIC.getValue())
                .timestamp(Instant.now())
                .topic(request.getTopic())
                .rawData(Map.of(
                        "topic", request.getTopic(),
                        "user_id", userId
                ))
                .build();

        return saveAndPublish(event);
    }

    @Override
    public InteractionResponse unfollowTopic(String coordinationId, String userId, FollowAndUnfollowRequest request) {
        loggerHelper(coordinationId, userId);

        InteractionEvent event = InteractionEvent.builder()
                .type(InteractionType.UNFOLLOW_TOPIC.getValue())
                .timestamp(Instant.now())
                .topic(request.getTopic())
                .rawData(Map.of(
                        "topic", request.getTopic(),
                        "user_id", userId
                ))
                .build();

        return saveAndPublish(event);
    }

    private InteractionResponse saveAndPublish(InteractionEvent event) {
        repository.save(event);
        eventProducer.sendEvent(event);
        return InteractionResponse.builder()
                .id(event.getId())
                .type(event.getType())
                .timestamp(event.getTimestamp())
                .build();
    }

    private void loggerHelper(String coordinationId) {
        log.info("[{}] Received interaction request", coordinationId);
    }

    private void loggerHelper(String coordinationId, String userId) {
        log.info("[{}] Received interaction request from [{}] user", coordinationId, userId);
    }
}
