import z from "zod";

// backend returns this, this could be any object like user : {id: z.number(), username: z.string()}
const TestSchema = z.object({
    message: z.string()
}).strict();

// backend uses this in it's endpoints' definitions - if the incoming request doesn't follow the schema, it's automatically rejected.
export const TestRequest = z.object({
    stringg: z.string("Value must be a string").min(1),
    numberr: z.number("Value must be a number")
}).strict();


// types for the frontend, essentially DTOs' definitions - they match whatever they're inferred from.
export type TestRequestType = z.infer<typeof TestRequest>;
export type TestResponseType = z.infer<typeof TestSchema>;
