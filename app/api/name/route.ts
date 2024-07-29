import { MODEL, openai } from "@/ai/client";
import { extractXMLTag } from "@/lib/extractXMLTag";

import isLive from "@/lib/isLive";

/**
 * Asynchronous function to handle POST requests. It uses the OpenAI API's chat model to generate completions
 * and return a formatted response. If the application is not live, it returns an error response.
 * The application name is extracted from the XML tag 'appname' in the response content.
 * @param {Request}  req - The incoming HTTP request
 * @returns {Response} Response with name extracted from API response, 
 *                     or an error response if application is not live
 */
export async function POST(req: Request) {
  if (!isLive) {
    return new Response(JSON.stringify({ error: "Not live" }), { status: 400 });
  }

  const { desc } = await req.json();

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: desc,
      },
    ],
    max_tokens: 4000,
  });

  console.log(response);

  const content = response.choices[0].message.content;

  const name = extractXMLTag(content!, "appname");

  return new Response(JSON.stringify({ name }), { status: 200 });
}

const prompt = `You are an expert application namer. The user will give you a description
of an application and you will create a simple name for it. These applications are for the
Windows9X operating system, a retrofuturistic operating system. make the names creative and 
whimsical. Put the name in <appname> tags.
`;
