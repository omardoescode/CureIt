import logger from "@/lib/logger";
import env from "@/utils/env";
import { InternalServerError, InvalidData } from "@/utils/error";
import {
  ContentProcessingOutput,
  type ContentProcessingOuptut,
} from "@/validation/content";

export const ContentProcessingClient = {
  async process(
    coordination_id: string,
    content_url: string,
  ): Promise<ContentProcessingOuptut | InternalServerError | InvalidData> {
    const response = await fetch(
      `${env.CONTENT_PROCESSING_SERVICE_URL}/api/process`,
      {
        method: "POST",
        body: JSON.stringify({ content_url }),
        headers: {
          "Content-Type": "application/json",
          "CureIt-Coordination-Id": coordination_id,
        },
      },
    );

    if (response.status === 400)
      return new InvalidData(`Invaild data, ${await response.text()}`);

    logger.info(`Processing content_url=${content_url}`);
    const json = await response.json();
    const parsed = ContentProcessingOutput.safeParse(json);

    if (parsed.error) {
      const sample = { ...json };
      delete sample["markdown"];
      logger.debug(
        `content-processing service returned invalid json: ${JSON.stringify(sample)}`,
      );
      logger.error(parsed.error.issues);
      return new InternalServerError();
    }

    return parsed.data;
  },
};
