"use client";

import { getDefaultStore } from "jotai";
import { focusedWindowAtom } from "../state/focusedWindow";
import { windowsListAtom } from "@/state/windowsList";
import { MIN_WINDOW_SIZE, WindowState, windowAtomFamily } from "@/state/window";

/**
 * Function that creates a window with specified parameters. It generates a random id and sets window, window list and focused window in the default store.
 * @param {Object} {title, program, loading, size, pos, icon} - Configuration object for the window
 * @param {string} title - The title of the window 
 * @param {WindowState["program"]} program - The program to be loaded in the window 
 * @param {boolean} [loading = false] - Indicator to show if the program is currently loading 
 * @param {WindowState["size"]} [size = { ...MIN_WINDOW_SIZE, height: "auto" }] - Size of the window 
 * @param {WindowState["pos"]} [pos = { x: 200, y: 200 }] - Position where the window should appear 
 * @param {string} [icon] - Icon for the window 
 */

export function createWindow({
  title,
  program,
  loading = false,
  size = { ...MIN_WINDOW_SIZE, height: "auto" },
  pos = { x: 200, y: 200 },
  icon,
}: {
  title: string;
  program: WindowState["program"];
  loading?: boolean;
  size?: WindowState["size"];
  pos?: WindowState["pos"];
  icon?: string;
}) {
  const id = generateRandomId();
  getDefaultStore().set(windowAtomFamily(id), {
    type: "INIT",
    payload: { title, program, id, loading, size, pos, icon },
  });
  getDefaultStore().set(windowsListAtom, { type: "ADD", payload: id });
  getDefaultStore().set(focusedWindowAtom, id);
}

/**
 * A function that generates a random unique identifier 
 * by leveraging the Math.random() function.
 * The generated identifier comprises alphanumeric characters.
 *
 * @returns {String} Returns a randomly generated unique identifier in string format.
 */
function generateRandomId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
