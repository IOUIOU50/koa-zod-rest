import Router from '@koa/router';
import { Middleware } from 'koa';
import { AnyZodObject, z } from 'zod';
import { generateSwaggerPath } from './gen-swagger-path';
import { routeHttpMethods } from './route-method';
import { HttpMethod } from './types/http-method';
import { RouteConfig } from './types/route-config';
import { ValidatedRequest } from './types/validated-request';

export function rest<
  Headers extends AnyZodObject | undefined,
  Params extends AnyZodObject | undefined,
  Query extends AnyZodObject | undefined,
  Body extends AnyZodObject | undefined,
  ResponseBody extends AnyZodObject | undefined,
>(
  router: Router,
  method: HttpMethod,
  path: string,
  routeConfig: RouteConfig<Headers, Params, Query, Body, ResponseBody>,
  ...handlers: Middleware<
    any,
    { data: ValidatedRequest<Headers, Params, Query, Body> },
    ResponseBody extends AnyZodObject ? z.infer<ResponseBody> : undefined
  >[]
): void {
  generateSwaggerPath(method, path, routeConfig);
  routeHttpMethods(router, method, path, routeConfig, ...handlers);
}
