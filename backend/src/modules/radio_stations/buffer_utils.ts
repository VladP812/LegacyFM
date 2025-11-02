import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import { Buffer } from "buffer";

export function mp3ToWav(mp3Buffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const inputStream = new PassThrough();
        inputStream.end(mp3Buffer);

        const outputStream = new PassThrough();
        const chunks: Buffer[] = [];

        ffmpeg(inputStream)
            .format("wav")
            .audioChannels(1)
            .audioFrequency(24000)
            .audioCodec("pcm_s16le")
            .on("error", reject)
            .pipe(outputStream);

        outputStream.on("data", chunk => chunks.push(Buffer.from(chunk)));
        outputStream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}
