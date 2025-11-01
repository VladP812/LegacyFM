import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { radio_stations } from "../schemas";
import { populateDbWithRadioStations } from "../scripts/populateDbWithInitialData";

// extend module interface for proper typing
declare module 'fastify' {
  interface FastifyInstance {
    db: NodePgDatabase;
  }
}

async function dbPlugin(fastify: FastifyInstance, options: Object) {
    const pool: Pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });
    const db: NodePgDatabase = drizzle(pool);

    const stations = await db.select().from(radio_stations)
    if (stations.length < 1) {
        await populateDbWithRadioStations(db);
    }

    fastify.decorate("db", db);
}

export default fastifyPlugin(dbPlugin);

