import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/schemas.ts",
    dbCredentials: {
        password: "qwerty123",
        host: "localhost",
        port: 5432,
        user: "neversleep",
        database: "legacy_fm",
        ssl: false,
    }
});

