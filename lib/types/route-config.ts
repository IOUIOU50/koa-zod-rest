import { Middleware } from 'koa';
import { OpenAPIObject, OperationObject } from 'openapi3-ts/oas30';
import { AnyZodObject } from 'zod';

export type RouteConfig<
  Headers extends AnyZodObject | undefined,
  Params extends AnyZodObject | undefined,
  Query extends AnyZodObject | undefined,
  Body extends AnyZodObject | undefined,
  ResponseBody extends AnyZodObject | undefined,
> = {
  request?: {
    headers?: Headers;
    params?: Params;
    query?: Query;
    body?: Body;
  };
  response?: {
    status?: number;
    schema?: ResponseBody;
    headers?: Record<string, string>;
    validation?: boolean;
  };
  middlewares?: {
    useBefore?: Middleware[];
    useAfter?: Middleware[];
  };

  /** If you set swagger and swagger.swaggerObject, lib sets swagger itself automatically by default */
  swagger?: {
    swaggerObject: OpenAPIObject;
    auto?: Omit<OperationObject, 'parameters' | 'requestBody' | 'responses'> & {
      tags?: string | string[];
    };
    custom?: OperationObject;
    hidden?: boolean;
  };
};
