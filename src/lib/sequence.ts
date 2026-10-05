import type { Model } from 'mongoose';

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Returns the next sequential code like `AC-1010` based on the highest number
 * that currently exists for `field` (NOT on document count, which breaks as
 * soon as any record is deleted and causes E11000 duplicate key errors).
 *
 * Example: nextSequentialCode(Member, 'accountNo', 'AC-', 1001)
 */
export async function nextSequentialCode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>,
  field: string,
  prefix: string,
  startAt = 1001,
  pad = 4
): Promise<string> {
  const pattern = new RegExp(`^${escapeRegex(prefix)}\\d+$`);
  const [top] = await model.aggregate<{ n: number }>([
    { $match: { [field]: { $regex: pattern } } },
    { $project: { n: { $toLong: { $substrCP: [`$${field}`, prefix.length, 32] } } } },
    { $sort: { n: -1 } },
    { $limit: 1 },
  ]);
  const next = top ? Math.max(Number(top.n) + 1, startAt) : startAt;
  return `${prefix}${String(next).padStart(pad, '0')}`;
}

/** True when the error is a MongoDB duplicate-key error (optionally on a given field). */
export function isDuplicateKeyError(err: unknown, field?: string): boolean {
  const e = err as { code?: number; keyPattern?: Record<string, unknown>; message?: string };
  if (e?.code !== 11000) return false;
  if (!field) return true;
  return Boolean(e.keyPattern?.[field]) || Boolean(e.message?.includes(`${field}_1`));
}

interface SequenceOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>;
  field: string;
  prefix: string;
  startAt?: number;
  pad?: number;
}

/**
 * Generates the next code and runs `create(code)`. If another request grabbed
 * the same code at the same moment (duplicate key on `field`), it regenerates
 * and retries.
 */
export async function createWithSequentialCode<T>(
  { model, field, prefix, startAt = 1001, pad = 4 }: SequenceOptions,
  create: (code: string) => Promise<T>,
  maxAttempts = 5
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const code = await nextSequentialCode(model, field, prefix, startAt, pad);
    try {
      return await create(code);
    } catch (err) {
      if (attempt < maxAttempts && isDuplicateKeyError(err, field)) continue;
      throw err;
    }
  }
}

/** Approval numbers: APP-<year>-1001, APP-<year>-1002, ... */
export function approvalNoSequence(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  approvalModel: Model<any>
): SequenceOptions {
  return { model: approvalModel, field: 'approvalNo', prefix: `APP-${new Date().getFullYear()}-`, startAt: 1001, pad: 4 };
}
