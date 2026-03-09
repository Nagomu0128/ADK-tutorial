import type { z } from "zod";

type ErrorBase = {
  readonly type: string;
  readonly message: string;
  readonly cause?: unknown;
};

type ErrorWithExtra<T> = ErrorBase & {
  readonly extra: T;
};

type ErrorBuilder<Name extends string, Extra = never> = {
  (
    message: string,
    ...args: [Extra] extends [never] ? [] : [{ extra: Extra }]
  ): [Extra] extends [never]
    ? ErrorBase & { readonly type: Name }
    : ErrorWithExtra<Extra> & { readonly type: Name };
  readonly is: { readonly type: Name };
  readonly handle: (e: unknown) => ErrorBase & { readonly type: Name };
};

export const errorBuilder = <
  Name extends string,
  Extra = never,
>(
  name: Name,
  _schema?: z.ZodType<Extra>,
): ErrorBuilder<Name, Extra> => {
  const builder = (
    message: string,
    opts?: { extra: Extra },
  ) => ({
    type: name,
    message,
    ...(opts ? { extra: opts.extra } : {}),
  });

  builder.is = { type: name } as const;

  builder.handle = (e: unknown) => ({
    type: name,
    message: e instanceof Error ? e.message : String(e),
    cause: e,
  });

  return builder as ErrorBuilder<Name, Extra>;
};

export type InferError<T> = T extends ErrorBuilder<infer Name, infer Extra>
  ? [Extra] extends [never]
    ? ErrorBase & { readonly type: Name }
    : ErrorWithExtra<Extra> & { readonly type: Name }
  : never;
