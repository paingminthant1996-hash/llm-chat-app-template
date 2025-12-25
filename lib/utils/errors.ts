// Error handling utilities

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public userMessage?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred. Please try again.";
}

export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof AppError) {
    return error.code;
  }

  return undefined;
}

export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError && error.statusCode) {
    return error.statusCode;
  }

  return 500;
}

// Common error messages
export const ErrorMessages = {
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  NOT_FOUND: "The requested resource was not found.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied. You don't have permission to access this resource.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  TIMEOUT: "Request timed out. Please try again.",
  UNKNOWN: "An unexpected error occurred. Please try again.",
};

// Error handler for async operations
export async function handleAsyncError<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const message = errorMessage || getErrorMessage(error);
    throw new AppError(message, getErrorCode(error), getErrorStatusCode(error), message);
  }
}

