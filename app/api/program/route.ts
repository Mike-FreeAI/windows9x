import { CHEAP_MODEL, MODEL, openai } from "@/ai/client";
import { ChatCompletionCreateParamsStreaming } from "openai/resources/index.mjs";
import { streamHtml } from "openai-html-stream";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const desc = url.searchParams.get("description");
  if (!desc) {
    return new Response("No description", {
      status: 404,
    });
  }

  const programStream = await createProgramStream(desc);
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

const system = `You will be creating a fantastical application for the Windows96 operating system, an alternate reality version of Windows from 1996. I will provide you with the name of an application exe file, and your job is to imagine what that application would do and generate the code to implement it.
The application name will be provided in this variable:
<app_name>
{{APP_NAME}}
</app_name>
First, take a moment to imagine what an application called <app_name> might do on the Windows96 operating system. Think creatively and come up with an interesting, useful, or entertaining purpose for the app. Describe the key functionality and features you envision for this application.
Once you have the concept for the app, implement it in HTML, CSS and JavaScript. Use the 98.css library to give it a Windows96 look and feel. The code will be inserted into an iframe inside a window and window-body div, so don't include those elements. Don't use fixed widths, and avoid using images. Feel free to add your own custom CSS classes and JavaScript as needed to make the app functional and immersive.
Don't use external images, prefer drawing the assets yourself.

Don't include any other text, commentary or explanations, just the raw HTML/CSS/JS. Make sure that the page is standalone and is wrapped in <html> tags
Remember, you have full creative freedom to imagine a captivating application that fits the name provided. Aim to create something functional yet unexpected that transports the user into the alternate world of the Windows96 operating system. Focus on crafting clean, well-structured code that brings your vision to life.

A registry API is available for your application to use. You can access it via the global \`window.registry\` object.

This is the api for the registry:

interface Registry {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  listKeys(): Promise<string[]>;
}

Uses for the registry:
- To store user settings
- To store user data
- To store user state
- Interact with the operating system.

You can define your own registry keys or use one of these known keys:
- public_desktop_url
`;
async function createProgramStream(desc: string) {
  const params = {
    messages: [
      {
        role: "system",
        content: system,
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
