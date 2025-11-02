import { Readable } from "stream";

interface RadioStream {
    buffer: Buffer;
    startTime: number;
    duration: number; // in milliseconds
    currentOffset: number;
}

// Global state for each radio station
export const radioStreams = new Map<number, RadioStream>();

// Initialize or update a radio stream
export function updateRadioStream(stationId: number, audioBuffer: Buffer, duration: number) {
    radioStreams.set(stationId, {
        buffer: audioBuffer,
        startTime: Date.now(),
        duration,
        currentOffset: 0
    });
}

// Calculate current position in the audio stream
export function getCurrentStreamPosition(stream: RadioStream): number {
    const elapsed = Date.now() - stream.startTime;
    const position = elapsed % stream.duration;
    return position;
}

// Create a readable stream starting from the current position
export function createSyncedAudioStream(audioBuffer: Buffer, startOffset: number, sampleRate: number = 24000): Readable {
    const bytesPerMs = (sampleRate * 2) / 1000; // 2 bytes per sample for 16-bit audio
    const startByte = Math.floor(startOffset * bytesPerMs);
    
    let currentPosition = startByte;
    
    return new Readable({
        read(size) {
            if (currentPosition >= audioBuffer.length) {
                // Loop back to the beginning
                currentPosition = 0;
            }
            
            const chunk = audioBuffer.slice(currentPosition, currentPosition + size);
            currentPosition += chunk.length;
            
            if (chunk.length > 0) {
                this.push(chunk);
            }
        }
    });
}
