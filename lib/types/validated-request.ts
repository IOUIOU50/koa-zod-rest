import { AnyZodObject, z } from 'zod';

export type ValidatedRequest<
  Headers extends AnyZodObject | undefined,
  Params extends AnyZodObject | undefined,
  Query extends AnyZodObject | undefined,
  Body extends AnyZodObject | undefined,
> = {
  headers: Headers extends AnyZodObject ? z.infer<Headers> : undefined;
  params: Params extends AnyZodObject ? z.infer<Params> : undefined;
  query: Query extends AnyZodObject ? z.infer<Query> : undefined;
  body: Body extends AnyZodObject ? z.infer<Body> : undefined;
};
