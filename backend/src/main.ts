import Fastify from "fastify";
import fastifyCors from "@fastify/cors"
import { hasZodFastifySchemaValidationErrors, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

import { loadEnvFile } from "process";
import path from "path";
import db from "./plugins/db";
import { radioStationRoutes } from "./modules/radio_stations/radio_station_routes";
import { searchRoutes } from "./modules/radio_stations/search";

const envPath = path.join(__dirname, "../.env.development");
loadEnvFile(envPath);

if (process.env.NODE_ENV != "dev") {
    throw new Error("Set NODE_ENV=dev in .env.development");
}

const fastify = Fastify({
    logger: {
        level: process.env.NODE_ENV == "dev" ? "debug" : "info"
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
fastify.register(radioStationRoutes);
fastify.register(searchRoutes)

fastify.listen({port: 11337});
