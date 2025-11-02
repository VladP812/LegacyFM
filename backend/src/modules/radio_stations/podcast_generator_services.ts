import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai"
import { RadioStationType } from "@shared/DTOs";

export async function generatePodcastText(radioStation: RadioStationType, includeIntro: boolean) {
    console.log(radioStation);
    console.log(`Generating ${process.env.NODE_ENV=="dev" ? "2 sentences of podcast" : "full podcast text"} for ${radioStation.name}}`);
    const { text } = await generateText({
        model: openrouter('mistralai/ministral-8b'),
        prompt: `Write a ${process.env.NODE_ENV == "dev" ? "2 sentences" : "5 to 7 minutes worth of podcast text"} 
        about the history and legacy of ${radioStation.city} in ${radioStation.country}\n
        Make sure to include interesting as many interesting facts as possible.\n
        ${includeIntro ? "In the beginning, include a small intro, welcoming the listeners of 'Legacy FM' radio station."
            : "Do not include any intro text, start straight from the main point."}\n
            Do not include any outro text. Do not include any metadata such as podcaster`,
    });
    return text;
}

export async function generatePodcastSpeech(text: string) : Promise<Buffer> {
    const elevenLabs = new ElevenLabsClient();
    const audioStream = await elevenLabs.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb",{
        text,
        modelId: "eleven_monolingual_v1",
        outputFormat: 'mp3_44100_32'
    });

    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
        chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
}
