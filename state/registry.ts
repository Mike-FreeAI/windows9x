import { atom } from "jotai";
import { fileSystemAtom } from "./filesystem";
import { REGISTRY_PATH } from "@/lib/filesystem/defaultFileSystem";

export interface RegistryEntry {
  [key: string]: any;
}

export const registryAtom = atom(
  /**
   * This method reads a file from a given filesystem and returns it as a JSON object.
   * @param {Function} get - Function used to access the filesystem instance from the atom.
   * @returns {Object} The registry data as a parsed JSON object.
   */
  (get) => {
    const filesystem = get(fileSystemAtom);
    const registry = filesystem.readFile(REGISTRY_PATH);
    return JSON.parse(registry);
  },
  /**
   * This method updates a specific file in the file system and sets the state of the file system atom with the updated data
   * @param {Function} get - Function to retrieve the current state of the atom
   * @param {Function} set - Function to set the state of the atom
   * @param {Object} update: RegistryEntry - The new data that will be used to update the specific file 
   * @returns {void} The function doesn't return anything
   */
  (get, set, update: RegistryEntry) => {
    const filesystem = get(fileSystemAtom);
    const registry = filesystem.updateFile(
      REGISTRY_PATH,
      JSON.stringify(update)
    );
    set(fileSystemAtom, registry);
  }
);

export const DESKTOP_URL_KEY = "public_desktop_url";

export const BUILTIN_REGISTRY_KEYS = [DESKTOP_URL_KEY];
