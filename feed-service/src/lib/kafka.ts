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

export const consumer = kafka.consumer({
  groupId: env.KAFKA_GROUP_ID,
});

await retry(() => consumer.connect(), 1000, {
  connectionMsg: "Connected to consumer successfully",
  retryMsg: "failed to connect to consumer. Retrying after a second",
});
