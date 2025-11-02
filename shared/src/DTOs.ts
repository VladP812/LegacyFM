import z from "zod";

const RadioStationSchema = z.object({
    id: z.number(),
    name: z.string().min(1),
    country: z.string().min(1),
    city: z.string().min(1),
    description: z.string().min(1),
    lat: z.number(),
    lon: z.number(),
    voiceId: z.string().min(1)
}).strict();

export const CountrySearchResponse = z.object({
    prompt: z.string()
}).strict();

export const GetStationsResponse = z.array(RadioStationSchema);
export type RadioStationType = z.infer<typeof RadioStationSchema>;
export type GetStationsResponseType = z.infer<typeof GetStationsResponse>;


export const GetRadioStreamQueryString = z.object({
    id: z.coerce.number()
});
