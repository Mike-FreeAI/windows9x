import { MODEL, openai } from "@/ai/client";
import isLive from "@/lib/isLive";

/**
 * This function sends a POST request. If the system is live, it gets the 'messages' from the request,  
 * logs them, then attempts to create a completion with OpenAI API using the model and messages. 
 * The maximum token count for the response is set to 4000. The method then logs the response,
 * extracts the content from the response's choices, logs the content and returns it with a status of 200. 
 * If the system is not live, it immediately returns a 'Not live' error with a status of 400.
 *
 * @param {Request}  req - The incoming request object.
 * @returns {Response} A response object containing a JSON stringified content and status code. If system is live the status is 200, if not the status is 400.
 */
export async function POST(req: Request) {
  if (!isLive) {
    return new Response(JSON.stringify({ error: "Not live" }), { status: 400 });
  }

  const { messages } = await req.json();

  console.log(messages);

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [...messages],
    max_tokens: 4000,
    // response_format: returnJson ? { type: "json_object" } : { type: "text" },
  });

  console.log(response);

  const content = response.choices[0].message.content;

  console.log(content);

  return new Response(JSON.stringify(content), { status: 200 });
}
