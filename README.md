# koa-zod-rest

Expand your `koa.js` application with

- Request validation
- Access typed request data
- Automatically generated swagger

## dependencies

```bash
npm install koa \
            @koa/router \
            zod \
            @anatine/zod-openapi \
            koa2-swagger-ui
```

## devDependencies

```bash
npm install -D  typescript \
                @types/node \
                @types/koa \
                @types/koa__router \
                openapi3-ts
```

## super quick usage

```
import Koa from "koa";
import Router from "@koa/router";
import { rest } from "koa-zod-rest";
import { z } from "zod";
import { koaSwagger } from "koa2-swagger-ui";
import { OpenAPIObject } from "openapi3-ts/oas30";

const app = new Koa();
const router = new Router();
const swaggerObject: OpenAPIObject = {
  openapi: "3.0.0",
  info: {
    title: "title",
    version: "0.0.0",
  },
  paths: {},
};

rest(
  router,
  "post",
  "/samples",
  {
    request: {
      body: z.object({
        name: z.string(),
        value: z.string(),
      }),
    },
    response: {
      status: 201,
      schema: z.object({
        id: z.number(),
        name: z.string(),
        value: z.string(),
      }),
    },
    swagger: {
      swaggerObject,
      auto: {
        tags: ["Sample API"],
      },
    },
  },
  async (ctx) => {
    const { body } = ctx.data;
    ctx.status = 201;
    ctx.body = { id: 1, ...body };
  }
);

rest(
  router,
  "get",
  "/samples",
  {
    request: {
      query: z.object({
        sort: z.enum(["id", "name", "value"]).default("id"),
        order: z.enum(["asc", "desc"]).default("desc"),
        page: z.coerce.number().min(1).max(2_147_483_647).default(1),
        size: z.coerce.number().min(1).max(2_147_483_647).default(10),
        name: z.string().optional(),
        value: z.string().optional(),
      }),
    },
    response: {
      status: 200,
      schema: z.object({
        count: z.number(),
        samples: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            value: z.string(),
          })
        ),
      }),
    },
    swagger: {
      swaggerObject,
      auto: {
        tags: ["Sample API"],
      },
    },
  },
  async (ctx) => {
    const { sort, order, page, size, ...where } = ctx.data.query;
    ctx.status = 200;
    ctx.body = {
      count: 1,
      samples: [
        {
          id: 1,
          name: "name",
          value: "value",
        },
      ],
    };
  }
);

rest(
  router,
  "get",
  "/samples/{sampleId}",
  {
    request: {
      params: z.object({
        sampleId: z.coerce.number().min(1).max(2_147_483_647),
      }),
    },
    response: {
      status: 200,
      schema: z.object({
        id: z.number(),
        name: z.string(),
        value: z.string(),
      }),
    },
    swagger: {
      swaggerObject,
      auto: {
        tags: ["Sample API"],
      },
    },
  },
  async (ctx) => {
    ctx.status = 200;
    ctx.body = {
      id: ctx.data.params.sampleId,
      name: "name",
      value: "value",
    };
  }
);

rest(
  router,
  "patch",
  "/samples/{sampleId}",
  {
    request: {
      params: z.object({
        sampleId: z.coerce.number().min(1).max(2_147_483_647),
      }),
      body: z.object({
        name: z.string().optional(),
        value: z.string().optional(),
      }),
    },
    response: {
      status: 200,
      schema: z.object({
        id: z.number(),
        name: z.string(),
        value: z.string(),
      }),
    },
    swagger: {
      swaggerObject,
      auto: {
        tags: ["Sample API"],
      },
    },
  },
  async (ctx) => {
    ctx.status = 200;
    ctx.body = {
      id: ctx.data.params.sampleId,
      name: ctx.data.body.name ?? "name",
      value: ctx.data.body.value ?? "value",
    };
  }
);

rest(
  router,
  "delete",
  "/samples/{sampleId}",
  {
    request: {
      params: z.object({
        sampleId: z.coerce.number().min(1).max(2_147_483_647),
      }),
      body: z.object({
        name: z.string().optional(),
        value: z.string().optional(),
      }),
    },
    response: {
      status: 200,
      schema: z.object({
        id: z.number(),
        name: z.string(),
        value: z.string(),
      }),
    },
    swagger: {
      swaggerObject,
      auto: {
        tags: ["Sample API"],
      },
    },
  },
  async (ctx) => {
    ctx.status = 200;
    ctx.body = {
      id: ctx.data.params.sampleId,
      name: ctx.data.body.name ?? "name",
      value: ctx.data.body.value ?? "value",
    };
  }
);

app.use(
  koaSwagger({
    routePrefix: "/docs",
    swaggerOptions: { spec: { ...swaggerObject } },
  })
);
app.use(router.routes());

app.listen(3000, () => console.log("server started on port 3000"));
```
