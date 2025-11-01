import Fastify from "fastify";
import fastifyCors from "@fastify/cors"
import { hasZodFastifySchemaValidationErrors, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

import { loadEnvFile } from "process";
import path from "path";
import testRoutes from "./modules/testmodule/test_routes";
import db from "./plugins/db";

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

// standardized response interceptor for 
fastify.setErrorHandler((err, req, reply) => {
    const code = err.statusCode ?? 500;
    return reply.code(code).send(err.message);
});

// database
fastify.register(db);
fastify.register(testRoutes);

fastify.listen({port: 11337});
