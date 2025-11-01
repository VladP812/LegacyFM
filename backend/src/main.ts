import Fastify from "fastify";
import fastifyCors from "@fastify/cors"
import { hasZodFastifySchemaValidationErrors, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

import { loadEnvFile } from "process";
import path from "path";
import testRoutes from "./modules/testmodule/test_routes";

loadEnvFile(path.join(__dirname, "../.env.development"));

const fastify = Fastify({
    logger: {
        level: process.env.NODE_ENV == "development" ? "debug" : "info"
    }
});

// setting up cors 
fastify.register(fastifyCors, {
    origin: true
});

// set schema validators and compilers to zod's (so fastify understands zod schemas in endpoints' definitions)
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

// generic response interceptor for zod errors returning basic error message instead of a full zod error
fastify.setErrorHandler((err, req, reply) => {
  if (hasZodFastifySchemaValidationErrors(err)) {
    return reply.code(400).send({
      error: 'Validation Error',
      message: "Request doesn't match the schema",
      statusCode: 400,
      details: {
        issues: err.validation,
        method: req.method,
        url: req.url,
      },
    });
  }
  return reply.send(err);
});

fastify.register(testRoutes);

fastify.listen({port: 11337});
