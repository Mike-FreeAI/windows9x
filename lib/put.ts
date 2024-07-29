// import { put as vercelPut } from "@vercel/blob";

/**
 * This asynchronous function writes data from a blob into a file in the specified path.
 * @param {string}  path - The relative path to the file in which the data from the blob should be written.
 * @param {Blob}  blob - The Blob object from which data should be written into the file.
 * @returns {string} The URL of the local server where the data from the blob has been written.
 */
export async function put(path: string, blob: Blob) {
  //   if (IS_LOCAL && process.env.NODE_ENV === "development") {
  const fs = await import("fs-extra");

  const buffer = await blob.arrayBuffer();
  const data = Buffer.from(buffer);
  await fs.outputFile(`${process.cwd()}/public/blob/${path}`, data);

  return `http://localhost:3000/blob/${path}`;
  //   }

  //   return (
  //     await vercelPut(path, blob, {
  //       access: "public",
  //     })
  //   ).url;
}
