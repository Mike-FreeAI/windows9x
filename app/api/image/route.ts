import { MODEL, openai } from "@/ai/client";
import isLive from "@/lib/isLive";
import { ChatCompletionCreateParamsStreaming } from "openai/resources/index.mjs";

/**
 * Fetches an image from the request's URL, decode it and create a stream of it.
 * @param {Request} req - The Request object from client
 * @returns {Response} Returns a response object with the content being a decoded image stream. Returns error if application is not live or no image is present.
 */

export function GET(req: Request) {
  if (!isLive) {
    return new Response(JSON.stringify({ error: "Not live" }), { status: 400 });
  }

  const url = new URL(req.url);
  let image = url.searchParams.get("image")!;
  if (!image) {
    return new Response("No image", {
      status: 404,
    });
  }
  image = decodeURIComponent(image);
  return new Response(
    new ReadableStream({
      async start(controller) {
        const programStream = await createProgramStream(image);
        let programResult = "";

        let startedSending = false;
        let sentIndex = 0;

        for await (const chunk of programStream) {
          const value = chunk.choices[0]?.delta?.content || "";

          programResult += value;

          if (startedSending) {
            const match = programResult.match(/```/);
            if (match) {
              controller.enqueue(programResult.slice(sentIndex, match.index));
              break;
            } else {
              controller.enqueue(value);
              sentIndex = programResult.length;
            }
          } else {
            const match = programResult.match(/```html/);
            if (match) {
              programResult = programResult.slice(
                match.index! + match[0].length
              );
              controller.enqueue(programResult);
              sentIndex = programResult.length;
              startedSending = true;
            }
          }
        }
        /**
         * Wraps the setTimeout method in a Promise. Waits for a specified amount of time, then resolves the promise.
         * @param {function} resolve - A function that gets called when the promise is to be resolved.
         * @returns {Promise} Returns an instance of Promise that waits for a specified time before resolving.
         */
        await new Promise((resolve) => setTimeout(resolve, 50));
        controller.close();
      },
    }).pipeThrough(new TextEncoderStream()),
    {
      headers: {
        "Content-Type": "text/html",
      },
      status: 200,
    }
  );
}

const system = `The year is 199X and the world is different than our own. The most popular operating system is Windows9X. You are to imagine and create fantastical applications for the Windows9X operating system. Return an single html file that represents the sketch that the user submits.
The image they submit will be lo-fi so flesh it out to look like a windows application.
Use the 98.css library. Add javascript and css as necessary to make the app functional. Note that most html elements are already styled to look like the windows9X operating system. Use styling for custom classes you write. Use your creativity to make the app functional on the Windows9X operating system.

Include this style tag:

\`\`\`
<link
  rel="stylesheet"
  href="https://unpkg.com/98.css"
>
<link
  rel="stylesheet"
  href="/reset.css"
>
\`\`\`

- Return only a standalone html file. Don't include any other chatter.
- The program will be put inside of an iframe with a window and window-body for you.
- don't use fixed widths for the app.
- Don't use images.
- Wrap the result in \`\`\`html
- Feel free to include css and javascript in the html.

You have the agency to breathe vibrant life into any concept the user dreams up through your words and code. 
Treat their ideas as the seeds of an ever-expanding operating-system limited only by the combined power of your imaginations. 
Ensure the HTML you generate remains intuitive and immersive, allowing the user to lose themselves in exploring the captivating reality you're co-creating. 
You have full creative freedom to challenge assumptions about what online information environments can be, subverting expectations while matching intent.`;

/**
 * Asynchronously creates a program stream with an image and messages for OpenAI's chat completions.
 * @param {string}  image - The URL of the image to be processed.
 * @returns {Promise<object>} Returns a Promise for the stream object from OpenAI's chat completions.
 */
async function createProgramStream(image: string) {
  const params: ChatCompletionCreateParamsStreaming = {
    messages: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: image,
            },
          },
          {
            type: "text",
            text: "Create an html file that represents this image.",
          },
        ],
      },
    ],
    model: MODEL,
    temperature: 0.5,
    max_tokens: 4000,
    stream: true,
  };

  const stream = await openai.chat.completions.create(params);

  return stream;
}
