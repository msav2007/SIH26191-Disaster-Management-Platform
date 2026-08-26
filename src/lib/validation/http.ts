import { ZodError } from 'zod';

export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return 'The request payload failed validation.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

export function createErrorResponse(
  message: string,
  status = 500,
  details?: Record<string, string>,
): Response {
  return Response.json(
    {
      status: 'error',
      message,
      ...(details ? { details } : {}),
    },
    {
      status,
    },
  );
}

