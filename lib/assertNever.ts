/**
 * This method throws an error for 'never' type value.
 * @param {never}  value - The unexpected value.
 * @returns {never} Throws an error with the unexpected value in the message.
 */
export const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${value}`);
};
