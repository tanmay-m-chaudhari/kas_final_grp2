const { z } = require("zod");

const LogLevelSchema = z.enum(["debug", "info", "warn", "error", "fatal"]);

const LogEntrySchema = z.object({
  level: LogLevelSchema,
  message: z.string().min(1).max(4096),
  service: z.string().min(1).max(128),
  timestamp: z.string().datetime().optional(),
  traceId: z.string().optional(),
  spanId: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
});

const BatchSchema = z.object({
  logs: z.array(LogEntrySchema).min(1).max(500),
  source: z.string().optional(),
});

function parseLogEntry(raw) {
  const result = LogEntrySchema.safeParse(raw);
  if (!result.success) return { ok: false, errors: result.error.flatten() };
  return { ok: true, data: result.data };
}

function parseBatch(raw) {
  const result = BatchSchema.safeParse(raw);
  if (!result.success) return { ok: false, errors: result.error.flatten() };
  return { ok: true, data: result.data };
}

module.exports = { parseLogEntry, parseBatch, LogLevelSchema };
