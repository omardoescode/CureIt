export interface ErrorDetails {
  reason: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [otherFields: string]: any;
}

export interface AppErrorResponse {
  error: {
    message: string;
    code: string;
    details: ErrorDetails;
  };
}
export class AppError extends Error {
  public readonly httpCode: number;
  public readonly errorCode: string;
  public readonly details: ErrorDetails;

  /**
   * @param httpCode The HTTP status code (e.g., 400, 404).
   * @param message The user-facing error message.
   * @param errorCode The internal application error code (STRING_NO_SPACES_ALL_UPPERCASE).
   * @param reason The primary reason for the error.
   * @param extraDetails Optional additional details.
   */
  constructor(
    httpCode: number,
    message: string,
    errorCode: string,
    reason: string,
    extraDetails?: Omit<ErrorDetails, "reason">,
  ) {
    super(message);

    Object.setPrototypeOf(this, AppError.prototype);

    this.name = this.constructor.name;
    this.httpCode = httpCode;
    this.errorCode = errorCode;

    this.details = {
      reason: reason,
      ...(extraDetails || {}),
    };
  }

  toResponse(): AppErrorResponse {
    return {
      error: {
        message: this.message,
        code: this.errorCode,
        details: this.details,
      },
    };
  }
}

export class InternalServerError extends AppError {
  constructor(message?: string, error?: unknown) {
    const defaultMessage = "An unexpected error occurred on the server.";
    const defaultReason = "A critical, unhandled exception was thrown.";
    const stack = error instanceof Error ? error.stack : undefined;

    super(
      500,
      message || defaultMessage,
      "INTERNAL_SERVER_ERROR",
      defaultReason,
      { stack: stack },
    );
  }
}

export class InvalidData extends AppError {
  constructor(message: string, reason: string = "you passed invalid data") {
    super(400, message, "INVALID_DATA", reason);
  }
}
