package com.cureit.interactionservice.service;

import com.cureit.interactionservice.entity.InteractionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${KAFKA_INTERACTION_EVENTS_TOPIC_NAME}")
    private String TOPIC;

    public void sendEvent(InteractionEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC, json);
            log.info("Sent event to Kafka topic [{}]: {}", TOPIC, json);
        } catch (Exception e) {
            log.error("Failed to send event to Kafka", e);
            throw new RuntimeException("Failed to send event to Kafka", e);
        }
    }
}
