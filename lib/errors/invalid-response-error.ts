import { ZodError } from 'zod';

export class InvalidResponseError extends Error {
  constructor(public zodErrors: ZodError) {
    super('Invalid response');
  }
}
