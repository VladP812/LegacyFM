import { GetRadioStreamQueryString, GetStationsResponse, GetStationsResponseType } from "@shared/DTOs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { radio_stations } from "../../schemas";

export const radioStationRoutes = (fastify: FastifyInstance, opts: any) => {
    fastify.withTypeProvider<ZodTypeProvider>().get("/stations",{
        schema: {
            response: {
                200: GetStationsResponse
            }
        }},
        async (req, res) => {
            const stationsDb = await fastify.db.select().from(radio_stations);
            let stations: GetStationsResponseType = [];
            for (const stationDb of stationsDb) {
                stations.push({
                    id: stationDb.id,
                    name: stationDb.name,
                    city: stationDb.city,
                    country: stationDb.country,
                    description: stationDb.description,
                    lat: stationDb.lat,
                    lon: stationDb.lon
                });
            }
            return stations;
        }
    );

    fastify.withTypeProvider<ZodTypeProvider>().get("/radio/:id/station", {
        schema: {
            querystring: GetRadioStreamQueryString
        }
    },
    async (req, res) => {
        const stationId = req.query.id;
        res.header("content-type", "audio/mpeg");
    });
};
