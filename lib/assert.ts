/**
 * Function that asserts a given condition. If the condition does not hold, throws an error with a specified message.
 * @param {any} condition - The condition to be asserted.
 * @param {string} message - The error message to throw if the condition does not hold.
 * @returns {void} This function does not have a return value, throws an error if assert condition fails.
 */
export function assert(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
