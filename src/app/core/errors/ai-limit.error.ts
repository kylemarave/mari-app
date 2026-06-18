import { AiLimitErrorPayload } from '../models/profile.models';

export class AiLimitError extends Error {
  readonly code: AiLimitErrorPayload['code'];
  readonly plan?: AiLimitErrorPayload['plan'];
  readonly limit?: number;
  readonly used?: number;
  readonly status: number;

  constructor(payload: AiLimitErrorPayload, status: number) {
    super(payload.error);
    this.name = 'AiLimitError';
    this.code = payload.code;
    this.plan = payload.plan;
    this.limit = payload.limit;
    this.used = payload.used;
    this.status = status;
  }

  get isUpgradeRequired(): boolean {
    return this.code === 'AI_LIMIT_REACHED';
  }
}
