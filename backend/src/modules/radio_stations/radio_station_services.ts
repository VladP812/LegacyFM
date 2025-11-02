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
export function startRadioStream(stationId: number, wavAudioBuffer: Buffer) {
    const wavHeaderSize = 44;
    const pcmBytes = wavAudioBuffer.length - wavHeaderSize;

    const bytesPerSecond = 24000 * 2; // sampleRate * bytesPerSample
    const durationMs = (pcmBytes / bytesPerSecond) * 1000;
    radioStreams.set(stationId, {
        buffer: wavAudioBuffer,
        startTime: Date.now(),
        duration: durationMs,
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
export function createSyncedAudioStream(wavAudioBuffer: Buffer, startTimeMs: number, sampleRate: number): Readable {
    const bytesPerMs = 48; // 24kHz * 16-bit mono
    const wavHeaderSize = 44;
    const startByte = wavHeaderSize + Math.floor(startTimeMs * bytesPerMs);

    // Slice PCM from start position to the end
    const pcmSlice = wavAudioBuffer.slice(startByte);

    // Prepend new WAV header
    const bufferToSend = createWavSlice(pcmSlice, sampleRate);

    let offset = 0;

    return new Readable({
        read(size) {
            if (offset >= bufferToSend.length) {
                this.push(null); // end of stream
                return;
            }

            const chunk = bufferToSend.slice(offset, offset + size);
            offset += chunk.length;
            this.push(chunk);
        }
    });
}


function createWavSlice(pcmBuffer: Buffer, sampleRate: number, channels = 1, bitDepth = 16): Buffer {
    const header = Buffer.alloc(44);
    const byteRate = sampleRate * channels * (bitDepth / 8);
    const dataSize = pcmBuffer.length;

    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataSize, 4); // RIFF chunk size
    header.write('WAVE', 8);

    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);        // fmt chunk size
    header.writeUInt16LE(1, 20);         // PCM format
    header.writeUInt16LE(channels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(channels * (bitDepth / 8), 32);
    header.writeUInt16LE(bitDepth, 34);

    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);  // PCM length

    return Buffer.concat([header, pcmBuffer]);
}
