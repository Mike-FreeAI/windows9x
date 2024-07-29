import { DEFAULT_FILE_SYSTEM } from "@/lib/filesystem/defaultFileSystem";
import { VirtualFileSystem, VirtualFolder } from "@/lib/filesystem/filesystem";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const privateFileSystemAtom = atomWithStorage<{ root: VirtualFolder }>(
  "filesystem",
  {
    root: DEFAULT_FILE_SYSTEM.toJSON(),
  }
);

export const fileSystemAtom = atom<
  VirtualFileSystem,
  [VirtualFileSystem | ((vs: VirtualFileSystem) => VirtualFileSystem)],
  any
>(
  /**
   * Creates and returns a new VirtualFileSystem instance with root directory obtained from 'privateFileSystemAtom'.
   * @param {function} get - A Getter function used for retrieving the state of 'privateFileSystemAtom'.
   * @returns {VirtualFileSystem} A newly created VirtualFileSystem instance.
   */
  (get) => new VirtualFileSystem({ root: get(privateFileSystemAtom).root }),
  /**
   * This function updates the new state of the file system atom either directly or using a function. It then sets the new state to the private file system atom.
   * @param {function} get - A function to get the current state of an atom.
   * @param {function} set - A function to update the state of an atom.
   * @param {AnyType | function} update - The new state of the file system atom or a function to compute it.
   */
  
  (get, set, update) => {
    const newState =
      typeof update === "function" ? update(get(fileSystemAtom)) : update;
    set(privateFileSystemAtom, { root: newState.toJSON() });
  }
);
