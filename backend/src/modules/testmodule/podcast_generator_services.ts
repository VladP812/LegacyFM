import { FastifyInstance } from "fastify";
import { RadioStation } from "../../types";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai"

export async function generatePodcastText(fastify: FastifyInstance, radioStation: RadioStation, includeIntro: boolean) {
        const { text } = await generateText({
            model: openrouter('mistralai/ministral-8b'),
            prompt: `Write a 5 to 7 minutes worth of podcast text about the history and legacy of ${radioStation.city} in ${radioStation.country}\n
                     Make sure to include interesting as many interesting facts as possible.\n
                    ${includeIntro ? "In the beginning, include a small intro, welcoming the listeners of 'Legacy FM' radio station."
                     : "Do not include any intro text, start straight from the main point."}\n
                     Do not include any outro text. Do not include any metadata such as podcaster`,
        });
        return text;
}

export async function generatePodcastSpeech(text: string) {
    return Buffer
}
