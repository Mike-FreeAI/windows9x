import { MODEL, openai } from "@/ai/client";
import { removeBackground } from "@/ai/removeBackground";
import isLive from "@/lib/isLive";
import { put } from "@/lib/put";

const REMOVE_BG = false;

/**
 * Handler for POST requests to generate an image icon
 * This function will do several things:
 * - It will check if the server is live, if not it will reject the request.
 * - It will extract the image prompt from the request body.
 * - It will use the prompt to generate a cloudflare image.
 * - If the REMOVE_BG flag is set, it will remove the background from the image.
 * - The image is then stored in the 'icons' directory with a unique name.
 * 
 * @param {Request}  req - The input request, should contain a 'name' field in its body
 * @returns {Promise<Response>} The response containing either an error message or the path of the generated image
 */
export async function POST(req: Request) {
  if (!isLive) {
    return new Response(JSON.stringify({ error: "Not live" }), { status: 400 });
  }
  const body = await req.json();
  const prompt = body.name;
  const imagePrompt = await genImagePrompt(prompt);
  if (!imagePrompt) {
    return new Response("", { status: 500 });
  }
  let image = await genCloudflareImage(imagePrompt);
  if (!image) {
    return new Response("", { status: 500 });
  }

  if (REMOVE_BG) {
    const noBg = await removeBackground(image);
    image = noBg;
  }
  const path = await put(`icons/${generateUniqueID()}.png`, image);
  return new Response(path, { status: 200 });
}

/**
 * Function for generating a unique identification string.
 * @returns {string} A unique 28-character alphanumeric string.
 */
function generateUniqueID() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

const imageDescriptionPrompt = `You are a master icon designer for Microsoft in the 90s. A user will give you the name of an exe and you will describe an icon for it. Return an object or symbol that should be used as an icon. Return only the object or symbol`;

/**
 * Generates an image prompt using OpenAI's API.
 * @param {string} name - The name that will be used as user content for message creation.
 * @returns {Promise<string>} A promise that resolves to a string containing a message content, with additional static elements appended.
 */
async function genImagePrompt(name: string) {
  const result = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: imageDescriptionPrompt },
      { role: "user", content: name },
    ],
  });

  return result.choices[0].message.content + ", icon, 32x32, 16 colors";
}

/**
 * Generates an image using Cloudflare's diffusion AI API, sending a POST request with the given prompt
 * @param {string} prompt - The string prompt to be sent in the body of the POST request
 * @returns {Promise<Blob | null>} A promise that resolves to the Blob image data if the request was successful, and null otherwise
 */
async function genCloudflareImage(prompt: string): Promise<Blob | null> {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "image/jpeg",
      Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
    },
    body: JSON.stringify({ prompt }),
  };

  const resp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning`,
    options
  );

  if (!resp.ok) {
    console.error("Error generating image", await resp.text());
    console.error("resp", resp);
    return null;
  }

  return await resp.blob();
}
