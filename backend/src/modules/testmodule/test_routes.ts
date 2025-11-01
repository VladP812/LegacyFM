import { TestRequest, TestResponseType } from "@shared/DTOs";
import { FastifyInstance } from "fastify";

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
        }
)};

export default testRoutes;
