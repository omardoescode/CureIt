import logger from "@/lib/logger";

export const retry = async <T>(
  fn: () => Promise<T>,
  ms: number,
  options?: {
    connectionMsg?: string;
    retryMsg?: string;
    timeout?: number;
  },
): Promise<T> => {
  while (true) {
    try {
      const p = options?.timeout
        ? Promise.race([
            fn(),
            new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error("Timeout Error")),
                options.timeout,
              ),
            ),
          ])
        : fn();
      const res = await p;
      if (options?.connectionMsg) logger.info(options.connectionMsg);
      return res;
    } catch (err) {
      if (options?.retryMsg) logger.warn(options.retryMsg);

      await new Promise((r) => setTimeout(r, ms));
    }
  }
};
