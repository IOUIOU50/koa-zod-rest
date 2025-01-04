import { ZodError } from 'zod';

export class InvalidRequestError extends Error {
  constructor(public zodErrors: ZodError) {
    super('Invalid request');
  }
}
