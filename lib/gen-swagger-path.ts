import { generateSchema } from '@anatine/zod-openapi';
import {
  HeaderObject,
  OperationObject,
  ParameterObject,
  ResponseObject,
} from 'openapi3-ts/oas30';
import { AnyZodObject, z } from 'zod';
import { RouteConfig } from './types/route-config';

export function generateSwaggerPath<
  Headers extends AnyZodObject | undefined,
  Params extends AnyZodObject | undefined,
  Query extends AnyZodObject | undefined,
  Body extends AnyZodObject | undefined,
  ResponseBody extends AnyZodObject | undefined,
>(
  method: string,
  path: string,
  routeConfig: RouteConfig<Headers, Params, Query, Body, ResponseBody>,
) {
  if (!routeConfig.swagger?.swaggerObject) {
    return;
  }
  if (routeConfig.swagger.hidden === true) {
    return;
  }
  if (!routeConfig.swagger.swaggerObject.paths[path]) {
    routeConfig.swagger.swaggerObject.paths[path] = {};
  }

  if (routeConfig.swagger?.custom) {
    routeConfig.swagger.swaggerObject.paths[path][method as any] =
      routeConfig.swagger?.custom;
  } else {
    const { tags = [], ...config } = routeConfig.swagger?.auto ?? {};
    routeConfig.swagger.swaggerObject.paths[path][method as any] = {
      tags: typeof tags === 'string' ? [tags] : tags,
      responses: [],
      ...config,
    } satisfies OperationObject;

    const parameters: ParameterObject[] = [];
    if (routeConfig.request?.headers) {
      const { properties = {}, required = [] } = generateSchema(
        routeConfig.request.headers,
      );
      for (const [key, { description, ...values }] of Object.entries(
        properties as Record<string, ParameterObject>,
      )) {
        parameters.push({
          in: 'header',
          name: key,
          description,
          schema: values as any,
          required: required.includes(key),
        });
      }
    }
    if (routeConfig.request?.params) {
      const { properties = {}, required: _required } = generateSchema(
        routeConfig.request.params,
      );
      for (const [key, { description, ...values }] of Object.entries(
        properties as Record<string, ParameterObject>,
      )) {
        parameters.push({
          in: 'path',
          name: key,
          description,
          schema: values as any,
          required: true,
        });
      }
    }
    if (routeConfig.request?.query) {
      const { properties = {}, required = [] } = generateSchema(
        routeConfig.request.query,
      );
      for (const [key, { description, ...values }] of Object.entries(
        properties as Record<string, ParameterObject>,
      )) {
        parameters.push({
          in: 'query',
          name: key,
          schema: values as any,
          description,
          required: required.includes(key),
        });
      }
    }
    routeConfig.swagger.swaggerObject.paths[path][method as any].parameters =
      parameters;

    if (routeConfig.request?.body) {
      routeConfig.swagger.swaggerObject.paths[path][method as any].requestBody =
        {
          content: {
            'application/json': {
              schema: generateSchema(routeConfig.request?.body ?? z.unknown()),
            },
          },
        };
    }

    const schema = generateSchema(routeConfig.response?.schema ?? z.unknown());
    const responseObject: ResponseObject = {
      description: routeConfig.swagger.auto?.description ?? '',
      headers: Object.keys(routeConfig.response?.headers ?? {}).reduce(
        (headers: { [key: string]: HeaderObject }, header) => {
          headers[header] = {
            schema: {
              type: 'string',
            },
          };
          return headers;
        },
        {},
      ),
      content: {
        'application/json': {
          schema: schema as any,
        },
      },
    };
    routeConfig.swagger.swaggerObject.paths[path][method as any].responses = {
      [routeConfig.response?.status as any]: responseObject,
    };
  }
}
