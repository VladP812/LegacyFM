import { pgTable, serial, text, doublePrecision} from 'drizzle-orm/pg-core';

export const radio_stations = pgTable('radio_stations', {
    id: serial('id').primaryKey(),
    name: text("name").notNull(),
    lat: doublePrecision("latitude").notNull(),
    lon: doublePrecision("longitude").notNull(),
});

