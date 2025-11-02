import { GetRadioStreamQueryString, GetStationsResponse, GetStationsResponseType } from "@shared/DTOs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { radio_stations } from "../../schemas";
import { Readable } from "stream";
import { createSyncedAudioStream, getCurrentStreamPosition, radioStreams, startRadioStream } from "./radio_station_services";



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
                    lon: stationDb.lon,
                    voiceId: stationDb.voiceId
                });
            }
            return stations;
        }
    );

    fastify.withTypeProvider<ZodTypeProvider>().get("/radio", {
        schema: {
            querystring: GetRadioStreamQueryString
        }
    },
    async (req, res) => {
        const id = Number(req.query.id);

        // Check if stream exists in memory
        let radioStream = radioStreams.get(id);

        if (!radioStream) {
            fastify.log.error(`Stream for radio station id ${id} is not running - how come?`);
            return res.code(500).send("Radio station is idle.");
        }

        // Calculate where in the stream we currently are
        const currentPosition = getCurrentStreamPosition(radioStream);

        // Create a synced stream starting from current position
        const audioStream = createSyncedAudioStream(radioStream.buffer, currentPosition, 24000);

        res.type('audio/wav');
        res.header('cache-control', 'no-cache');
        res.header('pragma', 'no-cache');
        res.header('transfer-encoding', 'chunked');

        // Handle client disconnect
        req.raw.on('close', () => {
            audioStream.destroy();
        });

        return res.send(audioStream);
    });
}
