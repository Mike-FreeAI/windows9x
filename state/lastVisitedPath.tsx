import { atom } from "jotai";

export const lastVisitedPathAtom = atom<string | null>(null);

/**
 * Returns the parent directory path from the provided full path.
 * @param {string}  path - The full path.
 * @returns {string} Returns the parent directory path.
 */
export function getParentPath(path: string): string {
  return path.split("/").slice(0, -1).join("/");
}
