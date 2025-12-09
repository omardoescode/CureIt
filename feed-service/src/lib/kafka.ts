import env from "@/env";
import { Kafka } from "kafkajs";
import { retry } from "@/utils/retry";

const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers: env.KAFKA_BROKERS,
  retry: {
    initialRetryTime: 100,
    maxRetryTime: 5000,
    retries: 20,
  },
});

export const curationConsumer = kafka.consumer({
  groupId: env.KAFKA_CURATION_UPDATE_TOPIC_NAME,
});

export const interactionConsumer = kafka.consumer({
  groupId: env.KAFKA_INTERACTION_EVENTS_TOPIC_NAME,
});

await Promise.all([
  retry(() => curationConsumer.connect(), 1000, {
    connectionMsg: "Connected to curation consumer successfully",
    retryMsg: "failed to connect to curation consumer. Retrying after a seocnd",
  }),
  retry(() => curationConsumer.connect(), 1000, {
    connectionMsg: "Connected to interaction consumer successfully",
    retryMsg:
      "failed to connect to interaction consumer. Retrying after a seocnd",
  }),
]);

export const test = "1";
