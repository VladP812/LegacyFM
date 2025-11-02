import { FastifyInstance } from "fastify";
import { radio_stations } from "../schemas";
import { generatePodcastSpeech, generatePodcastText } from "../modules/radio_stations/podcast_generator_services";
import { updateRadioStream } from "../modules/radio_stations/radio_station_services";

export async function cacheInitialAudio(fastify: FastifyInstance, opts?: any): Promise<void> {
    const stations = await fastify.db.select().from(radio_stations);
    fastify.log.info(`Caching initial podcast audio for ${stations.length} stations`);
    
    for (const station of stations) {
        fastify.log.info(`Getting podcast TEXT for ${station.name}`);
        const text: string = await generatePodcastText(station, true);
        fastify.log.info(`Getting podcast AUDIO for ${station.name}`);
        const audio: Buffer = await generatePodcastSpeech(text, station.voiceId);
        
        // Store in Redis
        await fastify.redis.set(`${station.id}`, audio);
        
        // Calculate duration (adjust based on your audio format)
        // For 24kHz, 16-bit mono audio
        const duration = (audio.length / (24000 * 2)) * 1000;
        
        // Initialize the broadcast stream
        updateRadioStream(station.id, audio, duration);
    }
    
    fastify.log.info(`Caching initial podcasts audio - DONE!`);
}
