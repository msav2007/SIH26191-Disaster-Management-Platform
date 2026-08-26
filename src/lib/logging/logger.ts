type LogContextValue =
  | boolean
  | number
  | string
  | null
  | undefined
  | LogContextValue[]
  | {
      [key: string]: LogContextValue;
    };

export type LogContext = Record<string, LogContextValue>;

type LogLevel = 'error' | 'info' | 'warn';

const redactedMarkers = ['apiKey', 'authorization', 'password', 'secret', 'token'];

function sanitize(value: LogContextValue): LogContextValue {
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item));
  }

  if (value && typeof value === 'object') {
    const sanitizedEntries = Object.entries(value).map(([key, entryValue]) => {
      const shouldRedact = redactedMarkers.some((marker) =>
        key.toLowerCase().includes(marker.toLowerCase()),
      );

      return [key, shouldRedact ? '[REDACTED]' : sanitize(entryValue)];
    });

    return Object.fromEntries(sanitizedEntries);
  }

  return value;
}

function write(level: LogLevel, scope: string, message: string, context?: LogContext): void {
  const payload = {
    level,
    scope,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context: sanitize(context) } : {}),
  };

  const serialized = JSON.stringify(payload);

  if (level === 'error') {
    console.error(serialized);
    return;
  }

  if (level === 'warn') {
    console.warn(serialized);
    return;
  }

  console.info(serialized);
}

export function createLogger(scope: string) {
  return {
    info(message: string, context?: LogContext) {
      write('info', scope, message, context);
    },
    warn(message: string, context?: LogContext) {
      write('warn', scope, message, context);
    },
    error(message: string, context?: LogContext) {
      write('error', scope, message, context);
    },
  };
}

