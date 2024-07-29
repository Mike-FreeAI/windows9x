import { VirtualFileSystem } from "./filesystem";

export const SYSTEM_PATH = "/system";
export const PROGRAMS_PATH = "/system/programs";
export const REGISTRY_PATH = "/system/registry.reg";
export const USER_PATH = "/user";

const metadata = { isSystem: true };

/**
 * Creates and returns a standard virtual file system structure. The structure created includes system, programs and users folders along with a registry file.
 * @returns {VirtualFileSystem} A standard/default virtual file system. 
 */
function createDefaultFileSystem(): VirtualFileSystem {
  return new VirtualFileSystem()
    .createFolder(SYSTEM_PATH, metadata)
    .createFolder(PROGRAMS_PATH, metadata)
    .createFolder(USER_PATH, metadata)
    .createFile(REGISTRY_PATH, "{}", metadata);
}

export const DEFAULT_FILE_SYSTEM = createDefaultFileSystem();
