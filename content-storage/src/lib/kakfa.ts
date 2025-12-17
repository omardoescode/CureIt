import env from "@/utils/env";
import { Kafka, Partitioners } from "kafkajs";

const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers: env.KAFKA_BROKERS,
  retry: {
    initialRetryTime: 100,
    maxRetryTime: 5000,
    retries: 20,
  },
});

export const producer = kafka.producer({
  createPartitioner: Partitioners.DefaultPartitioner,
});

export const consumer = kafka.consumer({
  groupId: env.KAFKA_GROUP_ID,
});
