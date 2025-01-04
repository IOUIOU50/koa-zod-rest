import Router from '@koa/router';
import { Middleware } from 'koa';
import { AnyZodObject, z, ZodError } from 'zod';
import { InvalidRequestError } from './errors/invalid-request-error';
import { InvalidResponseError } from './errors/invalid-response-error';
import { HttpMethod } from './types/http-method';
import { RouteConfig } from './types/route-config';
import { ValidatedRequest } from './types/validated-request';
import { bodyParser } from '@koa/bodyparser';

export function routeHttpMethods<
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
    {
      data: ValidatedRequest<Headers, Params, Query, Body>;
    },
    ResponseBody extends AnyZodObject ? z.infer<ResponseBody> : undefined
  >[]
): void {
  const { useBefore = [], useAfter = [] } = routeConfig.middlewares ?? {};
  if (routeConfig.request?.body) {
    useBefore.push(bodyParser());
  }
  router[method](
    path.replace(/{/g, ':').replace(/}/g, ''),
    ...useBefore,
    async (ctx, next) => {
      try {
        ctx.data = {
          headers: routeConfig.request?.headers?.parse(ctx.headers) ?? {},
          params: routeConfig.request?.params?.parse(ctx.params) ?? {},
          query: routeConfig.request?.query?.parse(ctx.query) ?? {},
          body: routeConfig.request?.body?.parse(ctx.request.body) ?? {},
        } as any;
      } catch (error) {
        throw new InvalidRequestError(error as ZodError);
      }

      if (routeConfig.response?.status) {
        ctx.status = routeConfig.response.status;
      }
      await next();
      if (
        routeConfig.response?.schema &&
        routeConfig.response.validation === true
      ) {
        const validation = routeConfig.response.schema.safeParse(ctx.body);
        if (!validation.success) {
          throw new InvalidResponseError(validation.error);
        }
      }
    },
    ...handlers,
    ...useAfter,
  );
}
