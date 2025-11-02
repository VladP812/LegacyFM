import { GetRadioStreamQueryString, GetStationsResponse, GetStationsResponseType } from "@shared/DTOs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { radio_stations } from "../../schemas";
import { Readable } from "stream";
import { createSyncedAudioStream, getCurrentStreamPosition, radioStreams, updateRadioStream } from "./radio_station_services";



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
    let stream = radioStreams.get(id);
    
    if (!stream) {
        // Load from Redis if not in memory
        const audioBuffer = await fastify.redis.getBuffer(`${id}`);
        if (!audioBuffer) return res.code(404).send();
        
        // Estimate duration based on buffer size (adjust based on your audio format)
        // For 24kHz, 16-bit mono: bytes / (24000 * 2) * 1000
        const duration = (audioBuffer.length / (24000 * 2)) * 1000;
        
        updateRadioStream(id, audioBuffer, duration);
        stream = radioStreams.get(id)!;
    }
    
    // Calculate where in the stream we currently are
    const currentPosition = getCurrentStreamPosition(stream);
    
    // Create a synced stream starting from current position
    const audioStream = createSyncedAudioStream(stream.buffer, currentPosition);
    
    // Set appropriate headers for audio streaming
    res.type('audio/mpeg'); // or 'audio/wav', 'audio/mp3' depending on your format
    res.header('Cache-Control', 'no-cache');
    res.header('Connection', 'keep-alive');
    res.header('Transfer-Encoding', 'chunked');
    
    // Handle client disconnect
    req.raw.on('close', () => {
        audioStream.destroy();
    });
    
    return res.send(audioStream);
    });
}
