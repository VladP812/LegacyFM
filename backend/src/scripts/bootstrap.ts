import { FastifyInstance } from "fastify";
import { generatePodcastSpeech, generatePodcastText } from "../modules/radio_stations/podcast_generator_services";
import { startRadioStream } from "../modules/radio_stations/radio_station_services";
import { RadioStationType } from "@shared/DTOs";
import { radio_stations } from "../schemas";
import { mp3ToWav } from "../modules/radio_stations/buffer_utils";

async function cacheInitialAudio(fastify: FastifyInstance, opts?: any): Promise<void> {
    const stations = await fastify.db.select().from(radio_stations);
    fastify.log.info(`Caching initial podcast audio for ${stations.length} stations`);
    
    for (const station of stations) {
        fastify.log.info(`Getting podcast TEXT for ${station.name}`);
        const text: string = await generatePodcastText(station, false);
        fastify.log.info(`Getting podcast AUDIO for ${station.name}`);
        const mp3podcast: Buffer = await generatePodcastSpeech(text, station.voiceId);
        const wavPodcast: Buffer = await mp3ToWav(mp3podcast);
        
        // Store in Redis
        await fastify.redis.set(`${station.id}`, wavPodcast);
        
        // Initialize the broadcast stream
        startRadioStream(station.id, wavPodcast);
    }
    fastify.log.info(`Caching initial podcasts audio - DONE!`);
}


async function populateDbWithRadioStations(fastify: FastifyInstance) {
    const stations: RadioStationType[] = [
        {
            id: 1,
            city: 'Yakutsk',
            name: 'Voices of the Permafrost',
            lat: 62.0355,
            lon: 129.6755,
            country: 'Russia',
            description: 'Voices of the Permafrost records oral testimonies and myths from the Sakha people of Siberia. Elders share stories of their ancestors, daily survival, and cosmological beliefs as the frozen landscape changes. Each program is an interview or narration preserving knowledge that has rarely been documented in writing.',
            voiceId: "wBXNqKUATyqu0RtYt25i"
        },
        {
            id: 2,
            city: 'Tbilisi',
            name: 'Polyphony Keepers',
            lat: 41.7151,
            lon: 44.8271,
            country: 'Georgia',
            description: 'Polyphony Keepers focuses on conversations with villagers and historians who safeguard Georgia’s rural storytelling heritage. The broadcasts feature recollections about customs, community gatherings, and the meanings behind traditional expressions. Listeners learn how oral transmission has sustained identity across generations.',
            voiceId: "65dhNaIr3Y4ovumVtdy0"
        },
        {
            id: 3,
            city: 'Timbuktu',
            name: 'Sands of Memory',
            lat: 16.7666,
            lon: -3.0026,
            country: 'Mali',
            description: 'Sands of Memory shares interviews with griots and scholars from Mali’s desert regions. The station documents how history was once passed entirely through speech and memory rather than books. Each episode explores stories of ancient kingdoms, trade routes, and the guardians of spoken knowledge.',
            voiceId: "wAGzRVkxKEs8La0lmdrE"
        },
        {
            id: 4,
            city: 'Goroka',
            name: 'Highland Echo',
            lat: -6.0835,
            lon: 145.3874,
            country: 'Papua New Guinea',
            description: 'Highland Echo broadcasts recorded oral histories from elders in Papua New Guinea’s highlands. The programs capture firsthand accounts of clan origins, belief systems, and ecological knowledge. Listeners hear the voices of people whose languages are seldom represented outside their own communities.',
            voiceId: "wtQQHWfMy9WeIYuth5ga"
        },
        {
            id: 5,
            city: 'Tórshavn',
            name: 'North Sea Whispers',
            lat: 62.0079,
            lon: -6.7900,
            country: 'Faroe Islands',
            description: 'North Sea Whispers presents spoken recollections of Faroese seafarers, farmers, and storytellers. Episodes discuss maritime survival, family traditions, and the moral lessons once passed down by word of mouth. It offers an intimate perspective on life in a remote North Atlantic culture.',
            voiceId: "EXAVITQu4vr4xnSDxMaL"
        },
        {
            id: 7,
            city: 'Pohnpei',
            name: 'Echoes of Nan Madol',
            lat: 6.8580,
            lon: 158.2080,
            country: 'Micronesia',
            description: 'Echoes of Nan Madol features storytelling sessions and recorded interviews about the myths surrounding Micronesia’s mysterious stone city. Elders explain the moral and historical lessons within these narratives. The programs emphasize language preservation and the philosophical depth of Pacific oral history.',
            voiceId: "SAz9YHcvj6GT2YYXdXww"
        },
        {
            id: 8,
            city: 'Bamiyan',
            name: 'Valley of Light Radio',
            lat: 34.8216,
            lon: 67.8273,
            country: 'Afghanistan',
            description: 'Valley of Light Radio documents spoken recollections from Hazara communities in central Afghanistan. The broadcasts feature interviews about family histories, folk wisdom, and community resilience. By relying solely on speech, it restores attention to a people whose voices were often excluded from written history.',
            voiceId: "cgSgspJ2msm6clMCkdW9"
        },
        {
            id: 9,
            city: 'Mérida',
            name: 'Maya Resonance FM',
            lat: 20.9674,
            lon: -89.5926,
            country: 'Mexico',
            description: 'Maya Resonance FM preserves spoken knowledge of cosmology, agriculture, and oral teaching among Yucatec Maya speakers. Storytellers explain seasonal ceremonies and traditional interpretations of the stars. The station uses conversation and narration to connect listeners with the worldview of precolonial America.',
            voiceId: "XrExE9yKIg1WjnnlVkGX"
        },
        {
            id: 10,
            city: 'Tromsø',
            name: 'Saami Soul Radio',
            lat: 69.6492,
            lon: 18.9553,
            country: 'Norway',
            description: 'Saami Soul Radio presents interviews and spoken reflections from reindeer herders and elders of the Saami people. It focuses on narratives about land, family, and the meaning of endurance in the far north. Each segment is a dialogue that keeps traditional knowledge alive through words alone.',
            voiceId: "onwK4e9ZLuTAKqWW03F9"
        },
        {
            id: 11,
            city: 'Valparaíso',
            name: 'Port of Forgotten Tongues',
            lat: -33.0472,
            lon: -71.6127,
            country: 'Chile',
            description: 'Port of Forgotten Tongues records conversations with descendants of the Chango and Kawésqar peoples of Chile’s coast. The broadcasts examine language revival and the stories that defined maritime identity. It’s a purely spoken archive aimed at cultural and linguistic preservation.',
            voiceId: "pqHfZKP75CvOlQylNhV4"
        },
        {
            id: 12,
            city: 'Oaxaca',
            name: 'Cloud People Radio',
            lat: 17.0732,
            lon: -96.7266,
            country: 'Mexico',
            description: 'Cloud People Radio hosts discussions and oral storytelling sessions with Zapotec and Mixtec elders. Listeners hear about ancestral governance, ecological balance, and moral instruction in community tales. The format avoids any performance elements, focusing entirely on conversation and narration.',
            voiceId: "iP95p4xoKVk53GoZ742B"
        },
        {
            id: 13,
            city: 'Karasjok',
            name: 'Spirit of the Tundra',
            lat: 69.4719,
            lon: 25.5113,
            country: 'Norway',
            description: 'Spirit of the Tundra shares spoken reflections on animistic beliefs and seasonal rituals among the Sámi. The programs feature dialogues between storytellers and younger generations learning to interpret traditional wisdom. The content is educational, introspective, and strictly narrative in nature.',
            voiceId: "bIHbv24MWmeRgasZH58o"
        },
        {
            id: 14,
            city: 'Apia',
            name: 'Ocean Memory FM',
            lat: -13.8333,
            lon: -171.7667,
            country: 'Samoa',
            description: 'Ocean Memory FM features oral interviews with Samoan elders who recount navigation traditions, kinship systems, and moral tales. The emphasis is on the words and meaning behind inherited stories rather than performance. It ensures that spoken wisdom continues to guide island communities.',
            voiceId: "pFZP5JQG7iQjIQuC4Bku"
        },
        {
            id: 15,
            city: 'Ségou',
            name: 'River Ancestors Radio',
            lat: 13.4317,
            lon: -6.2150,
            country: 'Mali',
            description: 'River Ancestors Radio captures firsthand oral accounts from Bozo fishing families along the Niger River. Speakers explain ancestral relationships with the river, seasonal changes, and intergenerational customs. The programs are documentary-style, composed entirely of interviews and narration.',
            voiceId: "JBFqnCBsd6RMkjVDRZzb"
        }
    ];
    await fastify.db.delete(radio_stations);
    const rs = await fastify.db.select().from(radio_stations);
    console.log("Radio Stations after deleting: " + rs.toString());
    for (const station of stations) {
        await fastify.db.insert(radio_stations).values(station);
    }
    const rs2 = await fastify.db.select().from(radio_stations);
    console.log("Radio Stations after population: " + rs.toString());
}

export async function initEverythingXD(fastify: FastifyInstance, opts?: any) {
    await populateDbWithRadioStations(fastify);
    await cacheInitialAudio(fastify);
}
