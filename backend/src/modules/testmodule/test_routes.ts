import { TestRequest, TestResponseType } from "@shared/DTOs";
import { FastifyInstance } from "fastify";
import { openrouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

import { ZodTypeProvider } from "fastify-type-provider-zod";

const testRoutes = (fastify: FastifyInstance, opts: any) => {
    fastify.withTypeProvider<ZodTypeProvider>().post("/test",{
        schema: {
            body: TestRequest
        }
        },
        async (req, res) => {
            const response: TestResponseType = {message: "Ready to rock?"};
            return response;
        });
    fastify.get("/testllm", async (req, res) => {
        const { text } = await generateText({
            model: openrouter('mistralai/ministral-8b'),
            prompt: 'Write a 3 minutes worth of podcast text about the history and legacy of Edinburgh',
        });
        return text;
    });
};

export default testRoutes;
