export const validPort = (val: string) => {
  if (!/^\d+$/.test(val))
    throw new Error(
      "CONTENT_PROCESSING_SERVICE_PORT must be an integer string",
    );

  const parsed = Number(val);
  if (parsed < 1 || parsed > 65535)
    throw new Error(
      "CONTENT_PROCESSING_SERVICE_PORT must be between 1 and 65535",
    );

  return parsed;
};
