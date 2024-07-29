import { ProgramEntry } from "@/state/programs";
import { RegistryEntry } from "@/state/registry";
import { getRegistryKeys } from "./getRegistryKeys";

/**
 * Computes and returns the URL for a given program based on registry keys.
 * @param {ProgramEntry}  program - The program for which URL is to be generated.
 * @param {RegistryEntry}  registry - The registry containing necessary keys used in the generation of the URL.
 * @returns {string} The generated URL for the provided program based on registry keys.
 */
export function getURLForProgram(
  program: ProgramEntry,
  registry: RegistryEntry
) {
  const keys = getRegistryKeys(registry);
  const keyString = JSON.stringify(keys);

  return `/api/program?description=${program.prompt}&keys=${encodeURIComponent(
    keyString
  )}`;
}
