const url = "https://sdk.photoroom.com/v1/segment";

/**
 * An async function to remove the background from a given image blob.
 * @param {Blob}  blob - The blob from which the background needs to be removed.
 * @returns {Promise<Blob>} A promise that resolves with the blob of the image without background.
 */
export async function removeBackground(blob: Blob): Promise<Blob> {
  const formData = new FormData();
  formData.append("image_file", new File([blob], "image.png"));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-Api-Key": process.env.PHOTOROOM_API_KEY,
    } as any,
    body: formData,
  });

  if (!response.ok) {
    console.error(response.json());
    throw new Error("Network response was not ok");
  }

  const imageBlob: Blob = await response.blob();

  return imageBlob;
}
