import { BUILTIN_REGISTRY_KEYS, RegistryEntry } from "@/state/registry";

/**
 * This method retrieves registry keys starting with 'public_' in a provided registry object, while also including built-in registry keys.
 * @param {RegistryEntry} registry - An object holding registry entries. 
 * @returns {string[]} Returns sorted array containing keys that start with 'public_' and built-in registry keys.
 */
export function getRegistryKeys(registry: RegistryEntry): string[] {
  const keys = new Set(
    /**
     * This method retrieves the keys of the 'registry' object which starts with the prefix "public_". 
     * @param {Object} registry - The object whose keys are to be filtered. 
     * @returns {Array} An array of keys which start with the prefix 'public_'.
     */
    Object.keys(registry).filter((key) => key.startsWith("public_"))
  );

  for (const key of BUILTIN_REGISTRY_KEYS) {
    keys.add(key);
  }

  return Array.from(keys).sort();
}
