package com.cureit.interactionservice.repository;

import com.cureit.interactionservice.entity.InteractionEvent;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InteractionEventRepository extends MongoRepository<InteractionEvent, String> {
}