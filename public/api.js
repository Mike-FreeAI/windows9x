// iframe/api.ts
var currId = 0;

class Registry {
  async get(key) {
    const id = currId++;
    window.parent.postMessage({ operation: "get", key, id }, "*");
    /**
     * Function to setup a promise that listens to a 'message' event on the window, when the event id matches the provided id, it resolves the promise with the event data value.
     * @param {string} id - The id to match event data with.
     * @returns {Promise} Returns a Promise that resolves with the matched event's data value.
     */
    return new Promise((resolve, reject) => {
      /**
       * Event listener for "message" event. Logs the event data and resolves when data id matches the provided id.
       * @param {MessageEvent} event - The event object, which contains the data passed with the "message" event.
       */
      
      window.addEventListener("message", (event) => {
        console.log("message", event.data);
        if (event.data.id === id) {
          resolve(event.data.value);
        }
      });
    });
  }
  async set(key, value) {
    const id = currId++;
    window.parent.postMessage({ operation: "set", key, value, id }, "*");
  }
  async delete(key) {
    const id = currId++;
    window.parent.postMessage({ operation: "delete", key, id }, "*");
  }
  async listKeys() {
    const id = currId++;
    window.parent.postMessage({ operation: "listKeys", id }, "*");
    /**
     * Creates a new Promise that resolves when a message event with a specified id is received. 
     * @returns {Promise} A promise that resolves with the value of the event data when an event with a matching id is found. 
     */
    return new Promise((resolve, reject) => {
      /**
       * This method is an event listener for the 'message' event on the window object. 
       * It checks if the data id in the event matches the specified id, and 
       * if it does, it resolves the promise with the value from the event data.
       * 
       * @param {object} event - The event object that's dispatched when a 'message' event occurs.
       * @returns {Promise} This method doesn't explicitly return anything but it resolves a Promise with the data value from the event, when the event data id matches the specified id.
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
 * This method posts a message to the parent window and listens for a response message with the same ID.
 * @param {Array.<string>}  messages - Array of string messages to be sent to the parent window.
 * @param {boolean} returnJson - A boolean flag to determine whether the return value is in JSON format or not.
 * @returns {Promise.<Object>} Promise that resolves with the value field from the response message received from the parent window.
 */
window.chat = (messages, returnJson) => {
  const id = currId++;
  window.parent.postMessage({ operation: "chat", value: messages, id, returnJson }, "*");
  /**
   * Method that creates a new Promise which resolves when a "message" event contains a data object matching the provided id.
   * @param {string}  id - The identifier to match the desired event data object.
   * @returns {Promise} Returns a Promise that resolves with the value of the event data object when the id matches.
   */
  return new Promise((resolve, reject) => {
    /**
     * This method adds an event listener to the window that waits for 'message' events. When a 'message' event occurs, 
     * it checks if the data carried by the message carries a certain id. If this check is true, the Promise associated 
     * with this operation is resolved with the value carried by this 'message' event.
     * @param {Event} event - The event object associated with the 'message' event.
     */
    
    window.addEventListener("message", (event) => {
      if (event.data.id === id) {
        resolve(event.data.value);
      }
    });
  });
};
var onSaveCallback = null;
/**
 * Method that assigns a callback function to be executed upon a save event and posts a message to the parent to indicate that a save event has been registered.
 * @param {function}  callback - Function to be executed upon a save event.
 * @returns {void}
 */
window.registerOnSave = (callback) => {
  onSaveCallback = callback;
  window.parent.postMessage({ operation: "registerOnSave" }, "*");
};
var onOpenCallback = null;
/**
 * Assigns a callback function to be executed when an open event occurs and communicates it to the parent window.
 * @param {Function}  callback - The function to be executed when an open event occurs.
 */
window.registerOnOpen = (callback) => {
  onOpenCallback = callback;
  window.parent.postMessage({ operation: "registerOnOpen" }, "*");
};
/**
 * The event handler for postMessage API events. It responds to "save" and "open" operations.
 * @param {Object} event - The MessageEvent object dispatched by the postMessage API.
 * @returns {undefined} This function does not have a return value.
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
window.registry = new Registry;
