# koa-zod-rest

> This document was automatically generated using OpenAI's o1 model.

A library that simplifies RESTful API development in Koa.js using Zod and OpenAPI, automating request/response validation and Swagger documentation generation.

## Introduction

`koa-zod-rest` is a library that assists in Koa applications by leveraging [Zod](https://github.com/colinhacks/zod) schemas to validate requests and responses, and automatically generates Swagger documentation according to the [OpenAPI](https://swagger.io/specification/) specification. This allows for easy type safety and documentation handling during API development.

## Features

- **Type Safety**: Define and validate request and response schemas using Zod.
- **Automatic Documentation**: Automatically generates Swagger documentation that complies with the OpenAPI specification.
- **Middleware Integration**: Seamlessly integrates with Koa's middleware.
- **Error Handling**: Provides clear errors when request or response validation fails.

## Installation

```bash
# dependencies
npm install koa @koa/router zod @anatine/zod-openapi koa2-swagger-ui

# devDependencies
npm install -D typescript @types/node @types/koa @types/koa__router openapi3-ts
```

Finally,

```bash
npm install koa-zod-rest
```

## Usage

Let's introduce how to use `koa-zod-rest` through a simple example.

### Basic Usage Example

```ts
import Koa from 'koa';
import Router from '@koa/router';
import { z } from 'zod';
import { rest } from 'koa-zod-rest';
import { koaSwagger } from 'koa2-swagger-ui';

const app = new Koa();
const router = new Router();

// Create OpenAPI document object
const swaggerObject = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
  },
  paths: {},
};

// Define request schema
const getUserParamsSchema = z.object({
  id: z.string().uuid(),
});

// Define response schema
const userResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
});

rest(
  router,
  'get',
  '/users/{id}',
  {
    request: {
      params: getUserParamsSchema, // then, `ctx.data.params` right after, it will be infered as `{ id: string; }`
    },
    response: {
      status: 200,
      schema: userResponseSchema, // then, `ctx.body` right after, it will be infered as `{ id: string; name: string; email: string }`
    },
    swagger: {
      swaggerObject,
      auto: {
        summary: 'Retrieve User Information',
        tags: ['User'],
      },
    },
  },
  async (ctx) => {
    // Logic to fetch user information (example)
    // In this handler, Just use koa's approach that you already know with `ctx.data`
    const { id } = ctx.data.params; // << This `ctx.data` will be inferred that you declared in `request.params` before

    // ...And, `ctx.body` must be one of `undefined` or `{id: string; ...}` that you declared in `response.schema` before.
    ctx.body = {
      id,
      name: 'Hong Gil-dong',
      email: 'hong@example.com',
    };
  },
);

// Swagger UI Setup
router.get(
  '/path-to-swagger', // << set your swagger document path
  koaSwagger({
    routePrefix: false,
    swaggerOptions: {
      spec: { ...swaggerObject },
    },
  }),
);

// Apply router and middleware
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

### Checking Swagger UI

After running the server, you can verify the automatically generated Swagger documentation by accessing [http://localhost:3000/path-to-swagger](http://localhost:3000/path-to-swagger).

## API

`koa-zod-rest` provides the following main features:

### `rest(router, method, path, routeConfig, ...handlers)`

Defines a RESTful API route, handling request/response validation and Swagger documentation generation.

- `router`: An instance of `@koa/router`'s Router
- `method`: HTTP method (`'get'`, `'post'`, `'put'`, `'delete'`, `'patch'`)
- `path`: API path (in Path-to-RegExp format)
- `routeConfig`: Route configuration object(Check out below details)
- `...handlers`: Koa middleware handlers

#### `routeConfig` Object

- `request`: Configuration for the request
  - `headers`: Zod schema for request headers (`AnyZodObject | undefined`)
  - `params`: Zod schema for URL parameters (`AnyZodObject | undefined`)
  - `query`: Zod schema for query parameters (`AnyZodObject | undefined`)
  - `body`: Zod schema for request body (`AnyZodObject | undefined`)
- `response`: Configuration for the response
  - `status`: HTTP status code (`number`, default: `200`)
  - `schema`: Zod schema for response body (`AnyZodObject | undefined`)
  - `headers`: Response headers (`Record<string, string>`, optional)
  - `validation`: Whether to validate the response (`boolean`, default: `false`)
- `middlewares`: Middleware settings
  - `useBefore`: Array of middlewares to execute before the handler (`Middleware[]`, optional)
  - `useAfter`: Array of middlewares to execute after the handler (`Middleware[]`, optional)
- `swagger`: Settings for Swagger documentation
  - `swaggerObject`: OpenAPI document object (`OpenAPIObject`)
  - `auto`: Automatically generated Swagger settings (`OperationObject`, optional)
    - `tags`: Tags (`string | string[]`, optional)
    - Other fields from [OperationObject](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#operationObject)
  - `custom`: Custom Swagger settings(**override**) (`OperationObject`, optional)
  - `hidden`: Whether to hide this route from the Swagger documentation (`boolean`, default: `false`)

## Error Handling

`koa-zod-rest` throws the following errors when request or response validation fails:

- `class InvalidRequestError extends Error {}`: When request validation fails
- `class InvalidResponseError extends Error {}`: When response validation fails

You can handle these errors in your application to return appropriate responses. For example:

```ts
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      ctx.status = 400;
      ctx.body = {
        message: error.message,
        errors: error.zodErrors.errors,
      };
    } else if (error instanceof InvalidResponseError) {
      ctx.status = 500;
      ctx.body = {
        message: error.message,
        errors: error.zodErrors.errors,
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        message: 'Internal Server Error',
      };
    }
  }
});
```

## Pure Koa's ctx

`koa-zod-rest` will not interfere with Koa's pure context. So, if you want to implement your business logic using Koa's standard methods, feel free to proceed as you already know how.

### Examples

- `ctx.req.headers` contains all the basic headers that you might need.
- `ctx.request.body` may contain multipart/form-data content. If so, please use other plugins or packages such as `multer`. and use it.

## License

Distributed under the [MIT License](LICENSE).

## Contributing

This project will not be actively maintained. So if you want to use an improved or new feature, feel free to fork or download the original source code and modify it.
