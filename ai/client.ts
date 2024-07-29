// import { initLogger, wrapOpenAI } from "braintrust";
import OpenAI from "openai";

type Provider = "openrouter" | "braintrust" | "openai" | "anthropic";
const MODE: Provider = process.env.BRAINTRUST_API_KEY
  ? "braintrust"
  : process.env.ANTHROPIC_API_KEY
  ? "anthropic"
  : process.env.OPEN_ROUTER_KEY
  ? "openrouter"
  : process.env.OPENAI_API_KEY
  ? "openai"
  : "openai"; // Default to OpenAI if no key is found

/**
 * Returns the model name based on the provided mode.
 * @param {"anthropic"|"braintrust"|"openrouter"|"openai"} mode - The provider mode.
 * @returns {string} The name of the model.
 */
const getModel = (mode: Provider) => {
  switch (mode) {
    case "anthropic":
    case "braintrust":
      return "claude-3-5-sonnet-20240620";
    case "openrouter":
      return "anthropic/claude-3.5-sonnet";
    case "openai":
      return "gpt-4o";
  }
};

/**
 * Creates an instance of OpenAI client based on the chosen AI provider mode. 
 * @param {string}  mode - The mode which specifies the AI provider to be used (either 'openai', 'openrouter', 'anthropic', or 'braintrust').
 * @returns {Object} An instance of OpenAI client configured with the base URL and API key corresponding to the chosen AI provider.
 */
const createClient = (mode: Provider) => {
  switch (mode) {
    case "openrouter":
      return new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPEN_ROUTER_KEY,
      });
    case "anthropic":
      return new OpenAI({
        baseURL: "https://braintrustproxy.com/v1",
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    case "braintrust":
      return new OpenAI({
        baseURL: "https://braintrustproxy.com/v1",
        apiKey: process.env.BRAINTRUST_API_KEY,
      });
    case "openai":
      return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
  }
};

export const MODEL = getModel(MODE);

// initLogger({
//   projectName: "windows96",
//   apiKey: process.env.BRAINTRUST_API_KEY,
// });

// export const openai = wrapOpenAI(createClient(MODE));

export const openai = createClient(MODE);
