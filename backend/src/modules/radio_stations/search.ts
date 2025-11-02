import { CountrySearchResponse } from "@shared/DTOs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { radio_stations } from "../../schemas";
import { generateText } from "ai"
import { openrouter } from "@openrouter/ai-sdk-provider";

export const searchRoutes = async (fastify: FastifyInstance, opts: any) => {
    fastify.withTypeProvider<ZodTypeProvider>().get("/search", {

    },
       async (req, res) => {
            const stationsDb = await fastify.db.select().from(radio_stations);
            let stations = [];
            for (const stationDb of stationsDb) {
                stations.push({
                    id: stationDb.id,
                    city: stationDb.city,
                    country: stationDb.country,                
                })
            }

        const BASE_PROMPT = `You are an expert in global geography and cultural studies.

        AVAILABLE COUNTRIES:
        ${JSON.stringify(stations)}

        INSTRUCTIONS:
        1. Read the cultural description
        2. Identify which country is MOST STRONGLY associated with this culture
        3. Find that country in the list above, explain your reasoning
        4. Return the relavent id in the format 'ID=[ID] for the STRONGEST ASSOCIATED country

        For ambiguous cases, choose the country where this culture ORIGINATED or is most iconic.

        CULTURAL DESCRIPTION:
        `;   
        const { text } = await generateText({
            model: openrouter('mistralai/ministral-8b'),
            prompt: `${BASE_PROMPT}${req.query.prompt}`,
        });


        return text.match(/ID=(\d+)/gm)[0].split("=")[1];    
    }
    );
}