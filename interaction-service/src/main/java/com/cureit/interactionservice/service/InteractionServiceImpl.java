package com.cureit.interactionservice.service;

import com.cureit.interactionservice.dto.*;
import com.cureit.interactionservice.entity.InteractionEvent;
import com.cureit.interactionservice.enums.InteractionType;
import com.cureit.interactionservice.repository.InteractionEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
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
	public ResponseEntity<Void> modifyTopic(String coordinationId, ModifyTopicRequest request) {
		loggerHelper(coordinationId);

		InteractionEvent event = InteractionEvent.builder().type(InteractionType.MODIFY_TOPIC.getValue())
				.timestamp(Instant.now()).contentId(request.getContentId()).topic(request.getTopic())
				.userWeight(request.getUserWeight()).build();

		saveAndPublish(coordinationId, event);
		return ResponseEntity.accepted().build();
	}

	@Override
	public ResponseEntity<Void> upvote(String coordinationId, VoteRequest request) {

		loggerHelper(coordinationId);

		InteractionEvent event = InteractionEvent.builder().type(InteractionType.UPVOTE.getValue())
				.userWeight(request.getUserWeight()).timestamp(Instant.now()).contentId(request.getContentId()).build();
		log.info("{}", event);

		saveAndPublish(coordinationId, event);
		return ResponseEntity.accepted().build();
	}

	@Override
	public ResponseEntity<Void> downvote(String coordinationId, VoteRequest request) {
		loggerHelper(coordinationId);

		InteractionEvent event = InteractionEvent.builder().type(InteractionType.DOWNVOTE.getValue())
				.userWeight(request.getUserWeight()).timestamp(Instant.now()).contentId(request.getContentId()).build();

		saveAndPublish(coordinationId, event);
		return ResponseEntity.accepted().build();
	}

	@Override
	public ResponseEntity<Void> modifyType(String coordinationId, ModifyTypeRequest request) {
		loggerHelper(coordinationId);

		InteractionEvent event = InteractionEvent.builder().type(InteractionType.MODIFY_TYPE.getValue())
				.timestamp(Instant.now()).contentId(request.getContentId()).contentType(request.getContentType())
				.userWeight(request.getUserWeight()).build();

		saveAndPublish(coordinationId, event);
		return ResponseEntity.accepted().build();
	}

	@Override
	public ResponseEntity<Void> followTopic(String coordinationId, String userId, FollowAndUnfollowRequest request) {
		loggerHelper(coordinationId, userId);

		InteractionEvent event = InteractionEvent.builder().type(InteractionType.FOLLOW_TOPIC.getValue())
				.timestamp(Instant.now()).topic(request.getTopic())
				.rawData(Map.of("topic", request.getTopic(), "user_id", userId)).build();

		saveAndPublish(coordinationId, event);
		return ResponseEntity.accepted().build();
	}

	@Override
	public ResponseEntity<Void> unfollowTopic(String coordinationId, String userId, FollowAndUnfollowRequest request) {
		loggerHelper(coordinationId, userId);

		InteractionEvent event = InteractionEvent.builder().type(InteractionType.UNFOLLOW_TOPIC.getValue())
				.timestamp(Instant.now()).topic(request.getTopic())
				.rawData(Map.of("topic", request.getTopic(), "user_id", userId)).build();

		saveAndPublish(coordinationId, event);
		return ResponseEntity.accepted().build();
	}

	private void saveAndPublish(String coordinationId, InteractionEvent event) {
		log.info("Saving to repository of interaction services");
		repository.save(event);
		log.info("Sending to the queue");
		eventProducer.sendEvent(coordinationId, event);
	}

	private void loggerHelper(String coordinationId) {
		log.info("[{}] Received interaction request", coordinationId);
	}

	private void loggerHelper(String coordinationId, String userId) {
		log.info("[{}] Received interaction request from [{}] user", coordinationId, userId);
	}
}
