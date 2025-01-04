const { rest } = require('../../index');
const Koa = require('koa');
const Router = require('@koa/router');
const { oas30 } = require('openapi3-ts');
const { z } = require('zod');

const app = new Koa();
const router = new Router();

/** @type {import("openapi3-ts").oas30.OpenAPIObject} */
const swaggerObject = {
  info: {
    title: 'title',
    version: 'version',
    contact: 'contact',
    description: 'description',
  },
  openapi: '3.0.0',
  paths: {},
};

rest(router, 'post', '/samples/{sampleId}', {
  request: {
    headers: z.object({
      'x-some-header': z.string(),
    }),
    params: z.object({
      sampleId: z.coerce.number(),
    }),
    query: z.object({
      name: z.string().optional(),
    }),
    body: z.object({
      value: z.string(),
    }),
  },
  response: {
    status: 200,
    schema: z.object({
      message: z.string(),
    }),
  },
  middlewares: [],
  swagger: {
    swaggerObject: swaggerObject,
  },
});

// error handler
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: 'error' };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => console.log('server started on 3000'));
