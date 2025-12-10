import env from "@/env";
import { Kafka } from "kafkajs";
import { retry } from "@/utils/retry";
import logger from "./logger";
import { InteractionEventSchema, type InteractionEvent } from "@/validation";

const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers: env.KAFKA_BROKERS,
  retry: {
    initialRetryTime: 100,
    maxRetryTime: 5000,
    retries: 20,
  },
});

const curationConsumer = kafka.consumer({
  groupId: env.KAFKA_GROUP_ID,
});

const interactionConsumer = kafka.consumer({
  groupId: env.KAFKA_GROUP_ID,
});

await Promise.all([
  retry(() => interactionConsumer.connect(), 1000, {
    connectionMsg: "Connected to curation consumer successfully",
    retryMsg: "failed to connect to curation consumer. Retrying after a seocnd",
  }),
  retry(() => curationConsumer.connect(), 1000, {
    connectionMsg: "Connected to interaction consumer successfully",
    retryMsg:
      "failed to connect to interaction consumer. Retrying after a seocnd",
  }),
]);

await interactionConsumer.subscribe({
  topic: env.KAFKA_INTERACTION_EVENTS_TOPIC_NAME,
  fromBeginning: true,
});

export { interactionConsumer, curationConsumer };
