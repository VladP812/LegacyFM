import { RadioStationType } from "@shared/DTOs";
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { radio_stations } from "../schemas";

export async function populateDbWithRadioStations(db: NodePgDatabase) {
    const stations: RadioStationType[] = [
        {
            id: 1, city: 'New York', name:
                'Big Apple Chronicles', lat: 40.7128, lon: -74.006, country: 'USA', description: 'Station about the history and the legacy of New York in USA'
        },
        { id: 2, city: 'London', name: 'London Legends', lat: 51.5074, lon: -0.1278, country: 'UK', description: 'Station about the history and the legacy of London in UK' }
    ]
    for (const station of stations) {
        await db.insert(radio_stations).values(station);
    }
}
