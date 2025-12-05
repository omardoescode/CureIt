import { Kafka, logLevel, Partitioners, type LogEntry } from "kafkajs";
import env from "./env";
import logger from "./lib/logger";
import CurationService from "./CurationService";
import { InteractionEventSchema, type InteractionEvent } from "./validation";
import Redis from "ioredis";

const redis = new Redis(env.REDIS_URL, {
  connectTimeout: 20000,
});

redis.on("error", function (error) {
  logger.error(error);
});

logger.info(`Kafka Brokers: ${env.KAFKA_BROKERS}`);

const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers: env.KAFKA_BROKERS,
  logLevel: logLevel.ERROR,
  retry: {
    initialRetryTime: 100,
    maxRetryTime: 5000,
    retries: 20,
  },
  logCreator:
    () =>
    ({ namespace, level, label, log }: LogEntry) => {
      if (level === logLevel.ERROR) {
        logger.error({
          service: "kafkajs",
          namespace,
          label,
          message: log.message,
          ...log.extra,
        });
      }
    },
});

const producer = kafka.producer({
  createPartitioner: Partitioners.DefaultPartitioner,
});
const consumer = kafka.consumer({
  groupId: env.KAFKA_GROUP_ID,
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
  maxWaitTimeInMs: 5000,
  rebalanceTimeout: 60000,
});
const admin = kafka.admin();

await Promise.all([
  redis
    .ping()
    .then(() => logger.info("Redis connected successfully"))
    .catch((err) => {
      logger.error(`Failed to connect to redis: ${err}`);
      process.exit(1);
    }),
  admin
    .connect()
    .then(() => logger.info("Admin connected successfully"))
    .catch((err) => {
      logger.error(`Failed to connect to Kafka admin: ${err}`);
      process.exit(1);
    }),
  producer
    .connect()
    .then(() => logger.info("Producer connected successfully"))
    .catch((err) => {
      logger.error(`Failed to connect to Kafka producer: ${err}`);
      process.exit(1);
    }),
  consumer
    .connect()
    .then(() => logger.info("Consumer connected successfully"))
    .catch((err) => {
      logger.error(`Failed to connect to Kafka consumer: ${err}`);
      process.exit(1);
    }),
]).then(() => logger.info("All connections are established successfully"));

await admin
  .createTopics({
    topics: [
      {
        topic: env.KAFKA_CURATION_UPDATE_TOPIC_NAME,
        numPartitions: 1,
      },
    ],
  })
  .then(() =>
    logger.info(`Created topic "${env.KAFKA_CURATION_UPDATE_TOPIC_NAME}"`),
  )
  .catch(() => {
    logger.error(
      `Failed to create topic "${env.KAFKA_CURATION_UPDATE_TOPIC_NAME}"`,
    );
    process.exit(1);
  });

const service = new CurationService(redis, producer);

await consumer
  .subscribe({
    topic: env.KAFKA_INTERACTION_EVENTS_TOPIC_NAME,
    fromBeginning: true,
  })
  .then(() =>
    logger.info(
      `Consumer successfully connected to ${env.KAFKA_INTERACTION_EVENTS_TOPIC_NAME}`,
    ),
  )
  .catch(logger.error);

await consumer.run({
  eachMessage: async ({ message }) => {
    const body = message.value?.toString();
    if (!body) {
      logger.warn("Received message with no value");
      return;
    }

    logger.info(`Received message: ${body}`);
    let parsed: InteractionEvent | null;
    try {
      const msg = JSON.parse(body);
      parsed = InteractionEventSchema.parse(msg);
    } catch (_) {
      logger.warn(`Invalid message received: ${body}`);
      return;
    }

    await service.handle_event(parsed);
  },
});
