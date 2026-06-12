export type ReportFormat = "markdown" | "json";

export interface RecordedRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: unknown;
}

export interface Redaction {
  path: string;
  reason: string;
}

export interface WebhookCassette {
  version: 1;
  name: string;
  createdAt: string;
  requests: RecordedRequest[];
  redactions: Redaction[];
}

export interface ReplayResult {
  method: string;
  url: string;
  status?: number;
  ok: boolean;
  dryRun: boolean;
}
