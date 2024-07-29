import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { fileSystemAtom } from "./filesystem";
import { PROGRAMS_PATH } from "@/lib/filesystem/defaultFileSystem";
import {
  VirtualFileSystem,
  VirtualFolder,
  VirtualItem,
} from "@/lib/filesystem/filesystem";

export type ProgramEntry = {
  id: string;
  name: string;
  prompt: string;
  code?: string;
  icon?: string | null;
};

type ProgramsState = {
  programs: ProgramEntry[];
};

type ProgramAction =
  | { type: "ADD_PROGRAM"; payload: ProgramEntry }
  | { type: "REMOVE_PROGRAM"; payload: string }
  | {
      type: "UPDATE_PROGRAM";
      payload: Partial<ProgramEntry> & { id: string };
    };

export const programsAtom = atom<ProgramsState, [ProgramAction], void>(
  /**
   * This method fetches the list of programs from the provided file system path. It filters out any invalid entries 
   * and returns an object with programs mapped to their corresponding program entries.
   * @param {function} get - A function that fetches values from atoms in a Recoil-based state management library.
   * @returns {Object} An object containing a list of the fetched program entries.
   */
  (get) => {
    const fs = get(fileSystemAtom);
    const programs = fs.listItems(PROGRAMS_PATH);
    return {
      programs: programs.map(getProgramEntry).filter(Boolean) as ProgramEntry[],
    };
  },
  /**
   * An arrow function leveraging get, set, and action parameters to perform an update on an atomic value in state.
   * @param {function} get - A getter function that retrieves the current state of a given atom.
   * @param {function} set - A setter function that sets the new state of a given atom.
   * @param {object} action - An action object that describes the type and payload of an action to be reduced.
   * @returns {void} This function does not have a return value; its side effect is to update the state of the fileSystemAtom.
   */
  (get, set, action) => {
    const fs = get(fileSystemAtom);
    set(fileSystemAtom, programsReducer(fs, action));
  }
);

/**
 * This function is used to fetch the entry of a program embedded in a virtual item. It assumes the 'VirtualItem' to be an object that represents either a virtual folder or a file.
 * It checks if the VirtualItem is a folder. If not, it returns null. If it's a folder, then it will try to find 'main.exe' and 'index.html' inside the 'items' of the folder.
 * If 'main.exe' is not available or its type is not a 'file' then the function will return null.
 * The function also fetches the 'index.html' (if available and its type is a 'file') content and assigns it to 'code'.
 * It then jumps into parsing the 'main.exe' and returns an object containing all the properties in main.exe along with 'id', 'name' and 'code' (index.html content (or) null).
 * @param {VirtualItem}  item - An object that represents either a virtual folder or a file. This object must have a 'type' property that distinguishes whether it's a 'folder' or 'file'.
 * @returns {ProgramEntry | null} Returns a new object that replicates the entire structure of a ProgramEntry or null.
 */
function getProgramEntry(item: VirtualItem): ProgramEntry | null {
  if (item.type !== "folder") return null;
  const folder = item as VirtualFolder;
  const main = folder.items["main.exe"];
  if (!main || main.type !== "file") {
    return null;
  }

  const index = folder.items["index.html"];
  let code: string | null = null;
  if (index && index.type === "file") {
    code = index.content;
  }
  const config = JSON.parse(main.content);
  return {
    ...config,
    id: folder.name,
    name: folder.name,
    code,
  };
}

/**
 * Reducer function for handling actions related to programs in a virtual file system.
 * @param {VirtualFileSystem}  fs - The current state of the virtual file system. 
 * @param {ProgramAction}  action - Action object describing what changes are to be made. 
 * @returns {VirtualFileSystem} Returns a new VirtualFileSystem after applying the specified action.
 */
function programsReducer(
  fs: VirtualFileSystem,
  action: ProgramAction
): VirtualFileSystem {
  switch (action.type) {
    case "ADD_PROGRAM": {
      const { code, id: _id, name: _name, ...rest } = action.payload;
      const path = `${PROGRAMS_PATH}/${action.payload.id}`;
      let newFs = fs
        .createFolder(path)
        .createFile(`${path}/main.exe`, JSON.stringify(rest))
        .createFile(`${path}/index.html`, code ?? "");

      return newFs;
    }
    case "REMOVE_PROGRAM": {
      return fs.delete(`${PROGRAMS_PATH}/${action.payload}`);
    }
    case "UPDATE_PROGRAM": {
      const path = `${PROGRAMS_PATH}/${action.payload.id}`;
      const { id: _id, name: _name, ...rest } = action.payload;
      let newFs = fs;

      if ("code" in rest) {
        const code = rest.code;
        delete rest.code;
        newFs = newFs.updateFile(`${path}/index.html`, code ?? "");
      }

      const existing = JSON.parse(fs.readFile(`${path}/main.exe`));
      if (existing) {
        newFs = newFs.updateFile(
          `${path}/main.exe`,
          JSON.stringify({ ...existing, ...rest })
        );
      }
      return newFs;
    }
  }
}

/**
 * The function 'programAtomFamily' is a factory that returns an atom which represents a particular program based on its 'id'.
 * The atom returned will get its state from a list of programs which is managed by another atom, 'programsAtom'.
 * @param {string}  id - The unique identifier of the specific program to be retrieved.
 * @returns {atom} An atom that contains the state of the specific program requested.
 */

export const programAtomFamily = atomFamily((id: string) =>
  /**
   * This method uses the 'atom' function to get a single program by its ID from the programs stored in 'programsAtom'.
   * @param {function} get - A function that returns the current state of an atom.
   * @returns {object|undefined} The program object with the matching ID, or undefined if no such program exists.
   */
  /**
   * This method retrieves a program by its 'id' from the 'programs' list managed by atoms.
   * @param {Object} get - A function provided by the atoms library to access global state.
   * @returns {Object | undefined} Returns the program object if an object was found with the provided 'id', otherwise returns undefined.
   */
  atom((get) => get(programsAtom).programs.find((p) => p.id === id))
);
