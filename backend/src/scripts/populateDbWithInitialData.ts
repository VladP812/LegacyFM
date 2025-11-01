import { RadioStationType } from "@shared/DTOs";
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { radio_stations } from "../schemas";

export async function populateDbWithRadioStations(db: NodePgDatabase) {
    const stations: RadioStationType[] = [
        {
            id: 1,
            city: 'New York',
            name: 'Big Apple Chronicles',
            lat: 40.7128,
            lon: -74.006,
            country: 'USA',
            description: 'Station about the history and the legacy of New York in USA'
        },
        {
            id: 2,
            city: 'London',
            name: 'London Legends',
            lat: 51.5074,
            lon: -0.1278,
            country: 'UK',
            description: 'Station about the history and the legacy of London in UK'
        },
        {
            id: 3,
            city: 'Tokyo',
            name: 'Tokyo Time Capsule',
            lat: 35.6762,
            lon: 139.6503,
            country: 'Japan',
            description: 'Station about the history and the legacy of Tokyo in Japan'
        },
        {
            id: 4,
            city: 'Sydney',
            name: 'Sydney Stories',
            lat: -33.8688,
            lon: 151.2093,
            country: 'Australia',
            description: 'Station about the history and the legacy of Sydney in Australia'
        },
        {
            id: 5,
            city: 'Paris',
            name: 'Parisian Past',
            lat: 48.8566,
            lon: 2.3522,
            country: 'France',
            description: 'Station about the history and the legacy of Paris in France'
        },
        {
            id: 6,
            city: 'Rio de Janeiro',
            name: 'Rio Rhythms & Roots',
            lat: -22.9068,
            lon: -43.1729,
            country: 'Brazil',
            description: 'Station about the history and the legacy of Rio de Janeiro in Brazil'
        },
        {
            id: 7,
            city: 'Dubai',
            name: 'Dubai Diaries',
            lat: 25.2048,
            lon: 55.2708,
            country: 'UAE',
            description: 'Station about the history and the legacy of Dubai in UAE'
        },
        {
            id: 8,
            city: 'Singapore',
            name: 'Singapore Stories',
            lat: 1.3521,
            lon: 103.8198,
            country: 'Singapore',
            description: 'Station about the history and the legacy of Singapore in Singapore'
        },
        {
            id: 9,
            city: 'Moscow',
            name: 'Moscow Memoirs',
            lat: 55.7558,
            lon: 37.6173,
            country: 'Russia',
            description: 'Station about the history and the legacy of Moscow in Russia'
        },
        {
            id: 10,
            city: 'Cape Town',
            name: 'Cape Town Chronicles',
            lat: -33.9249,
            lon: 18.4241,
            country: 'South Africa',
            description: 'Station about the history and the legacy of Cape Town in South Africa'
        }

    ]
    for (const station of stations) {
        await db.insert(radio_stations).values(station);
    }
}
