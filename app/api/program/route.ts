import { MODEL, openai } from "@/ai/client";
import { ChatCompletionCreateParamsStreaming } from "openai/resources/index.mjs";
import { streamHtml } from "openai-html-stream";
import { getApiText } from "@/lib/apiText";

import isLive from "@/lib/isLive";

/**
 * An asynchronous function for handling GET requests. It constitutes an error response when it's not live and also returns a response with HTML content with the requested program stream. 
 * The function also performs error handling with inappropriate descriptions.
 * @param {Request}  req - The HTTP request object from the client which includes the URL and search parameters.
 * @returns {Response} The function either returns a response object with an error message or a response that includes HTML content with the requested program stream.
 */
export async function GET(req: Request) {
  if (!isLive) {
    return new Response(JSON.stringify({ error: "Not live" }), { status: 400 });
  }

  const url = new URL(req.url);
  const desc = url.searchParams.get("description");
  const keys = JSON.parse(url.searchParams.get("keys") ?? "[]");
  if (!desc) {
    return new Response("No description", {
      status: 404,
    });
  }

  const programStream = await createProgramStream(desc, keys);
  return new Response(
    streamHtml(programStream, {
      injectIntoHead: `<script src="/api.js"></script>
<link
  rel="stylesheet" 
href="https://unpkg.com/98.css"
>
<link
  rel="stylesheet"
  href="/reset.css"
>`,
    }),
    {
      headers: {
        "Content-Type": "text/html",
      },
      status: 200,
    }
  );
}

/**
 * Creates a script for developers to create an application targeting the Windows9X OS.
 * This function provides instructions for an application to be executed on an imaginary OS, Windows9X.
 * It uses 98.css library to give it a classic-lookalike feel.
 * Requirements for code implementation (HTML, CSS, JavaScript) are detailed.
 * @param {array} keys - Names of the API defined on window that can be used by the application.
 * @returns {string} Instructional script for developing a Windows9X supporting application.
 */
function makeSystem(keys: string[]) {
  console.log(keys);
  return `You will be creating a fantastical application for the Windows9X operating system, an alternate reality version of Windows from 199X. I will provide you with the name of an application exe file, and your job is to imagine what that application would do and generate the code to implement it.
The application name will be provided in this variable:
<app_name>
{{APP_NAME}}
</app_name>
First, take a moment to imagine what an application called <app_name> might do on the Windows9X operating system. Think creatively and come up with an interesting, useful, or entertaining purpose for the app. Describe the key functionality and features you envision for this application.
Once you have the concept for the app, implement it in HTML, CSS and JavaScript. Use the 98.css library to give it a Windows9X look and feel, the library has already been included for you. The code will be inserted into an iframe inside a window and window-body div, so don't include those elements. Try not to make the root of the document hard coded in size, and avoid using images. Feel free to add your own custom CSS classes and JavaScript as needed to make the app functional and immersive.

- Don't use external images, prefer drawing the assets yourself.
- Don't ever use the 98.css \`window\` or \`window-body\` classes.
- Don't ever add a menu bar, the operating system will handle that for you.

Make the programs fill the entire screen.

Don't include any other text, commentary or explanations, just the raw HTML/CSS/JS. Make sure that the page is standalone and is wrapped in <html> tags
Remember, you have full creative freedom to imagine a captivating application that fits the name provided. Aim to create something functional yet unexpected that transports the user into the alternate world of the Windows9X operating system. Focus on crafting clean, well-structured code that brings your vision to life.


The Operating System provides a few apis that your application can use. These are defined on window:

${getApiText(keys)}
`;
}

/**
 * Creates a program stream with specified description and keys.
 * @param {string}  desc - Description for the program.
 * @param {string[]}  keys - Keys related to the program.
 * @returns {Promise} Returns a Promise that resolves to a stream object.
 */
async function createProgramStream(desc: string, keys: string[]) {
  const params = {
    messages: [
      {
        role: "system",
        content: makeSystem(keys),
      },
      {
        role: "user",
        content: `<app_name>${desc}</app_name>`,
      },
    ],
    model: MODEL,
    temperature: 1,
    max_tokens: 4000,
    stream: true,
  };

  const stream = await openai.chat.completions.create(
    params as ChatCompletionCreateParamsStreaming
  );

  return stream;
}
