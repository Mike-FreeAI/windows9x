let currId = 0;

class Registry {
  async get(key: string): Promise<any> {
    const id = currId++;
    window.parent.postMessage({ operation: "get", key, id }, "*");
    /**
     * Function to create a new Promise which resolves when a message event with the given ID is received.
     * @param {string}  id - The unique identifier for the event to listen for.
     * @returns {Promise} Returns a Promise that resolves to the value of the event.data when an event with the matching ID is received.
     */
    return new Promise((resolve, _reject) => {
      /**
       * Event listener function that listens for 'message' events on the window object, logs the event data to the console, 
       * and evaluates if the data id matches the predefined id, resolving the promise with the event data value if they match.
       * @param {Object} event - The event object that contains event data.
       * @returns {Promise<Any>} A Promise that resolves with the value of the event data if the id of the event data matches 
       * the predefined id.
       */
      window.addEventListener("message", (event) => {
        console.log("message", event.data);
        if (event.data.id === id) {
          resolve(event.data.value);
        }
      });
    });
  }
  async set(key: string, value: any): Promise<void> {
    const id = currId++;
    window.parent.postMessage({ operation: "set", key, value, id }, "*");
  }

  async delete(key: string): Promise<void> {
    const id = currId++;
    window.parent.postMessage({ operation: "delete", key, id }, "*");
  }

  async listKeys(): Promise<string[]> {
    const id = currId++;
    window.parent.postMessage({ operation: "listKeys", id }, "*");
    /**
     * Creates a new promise that resolves when the window postMessage event listener receives a message with a matching ID.
     * @param {string} id - The ID to match against the data's ID received in the window's postMessage event.
     * @returns {Promise<any>} A promise that resolves with the value from the data of the window's postMessage event with the matching ID.
     */
    return new Promise((resolve, _reject) => {
      /**
       * Listens for 'message' event on the window object and resolves if the event's data id matches the given id.
       * This function is typically used in the context of a promise.
       * 
       * @param {Event} event - An event triggered by the message action. 
       * The data property of this event must be an object that contains both an 'id' and a 'value' property.
       */
      window.addEventListener("message", (event) => {
        if (event.data.id === id) {
          resolve(event.data.value);
        }
      });
    });
  }
}

/**
 * The `chat` method is designed for interacting with a chat interface, most likely within an iframe. This method sends an array of messages to the parent window, and receives a response via a promise. Whether the response will be returned in JSON format or not is governed by a boolean flag `returnJson`.
 * @param {Array}  messages - An array of messages to be sent.
 * @param {boolean} returnJson - A flag indicating whether the response should be in JSON format or not. By default, this is undefined.
 * @returns {Promise} Returns a promise that will be resolved when a message is received from the parent window with the same id as the one sent. This promise resolves with the value of the response as argument.
 */
(window as any).chat = (messages: any[], returnJson?: boolean) => {
  const id = currId++;
  window.parent.postMessage(
    { operation: "chat", value: messages, id, returnJson },
    "*"
  );
  /**
   * This method creates a new promise that will resolve when a 'message' event with matching id is received.
   * @param {MessageEvent} event - The event object received when the 'message' event is triggered.
   * @returns {Promise} Resolves with the value property of the event data object when an event with matching id is received.
   */
  return new Promise((resolve, _reject) => {
    /**
     * Handles incoming message events by checking if the event's data ID matches the predefined ID, then removing the message event listener and resolving the promise with event's data value if matched.
     * @param {MessageEvent}  event - The message event received from another context like a window, worker, or any message emitter.
     * @returns {void} This function does not return anything. It manipulates the state of events by removing listener if certain conditions are met.
     */
    const messageHandler = (event: MessageEvent) => {
      if (event.data.id === id) {
        window.removeEventListener("message", messageHandler);
        resolve(event.data.value);
      }
    };
    window.addEventListener("message", messageHandler);
  });
};

let onSaveCallback: (() => string) | null = null;
/**
 * Registers a callback to be triggered on save event and communicates with the parent window.
 * @param {function}  callback - The function that will be called when a save event occurs. The function should return a string.
 */
(window as any).registerOnSave = (callback: () => string) => {
  onSaveCallback = callback;
  window.parent.postMessage({ operation: "registerOnSave" }, "*");
};

let onOpenCallback: ((content: string) => void) | null = null;
/**
 * The method registers a callback to be invoked when a window opens. It posts a message to the parent window to notify it of the registration.
 * @param {(content: string) => void}  callback - A callback function that's triggered when the window opens. The function takes a string type parameter 'content'.
 */
(window as any).registerOnOpen = (callback: (content: string) => void) => {
  onOpenCallback = callback;
  window.parent.postMessage({ operation: "registerOnOpen" }, "*");
};

/**
 * An EventListener for 'message' event on window object. It handles 'save' and 'open' operations.
 * @param {Object} event - The message event received.
 * @returns {void} This function does not have a return value. It posts a message to the parent window if necessary.
 */
window.onmessage = (event) => {
  if (event.data.operation === "save") {
    const content = onSaveCallback?.();
    if (content) {
      window.parent.postMessage({ operation: "saveComplete", content }, "*");
    }
  }

  if (event.data.operation === "open") {
    const content = event.data.content;
    onOpenCallback?.(content);
  }
};

(window as any).registry = new Registry();
