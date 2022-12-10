import { Stream } from "stream";

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;

  const sizes = [
    "bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * @copyright https://stackoverflow.com/users/521197/bsorrentino
 * @copyright https://stackoverflow.com/users/462347/mike
 * @param {Stream} stream
 * @returns {Promise<Buffer>}
 */
function streamToBuffer(stream: Stream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const _buf: Uint8Array[] = [];

    stream.on("data", (chunk) => _buf.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(_buf)));
    stream.on("error", (err) => reject(err));
  });
}

export async function timer(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
