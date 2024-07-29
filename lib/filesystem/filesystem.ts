import { produce, immerable } from "immer";

export type VirtualItem = VirtualFile | VirtualFolder;

export type VirtualFile = {
  type: "file";
  name: string;
  content: string;
  metaData: Record<string, any>;
};

export type VirtualFolder = {
  type: "folder";
  name: string;
  items: Record<string, VirtualItem>;
  metaData: Record<string, any>;
};

/**
 * Creates a virtual file object with specified name, content, and metadata.
 * @param {string} name - Specific names assigned to the virtual file.
 * @param {string} content - Contents stored within the virtual file.
 * @param {Record<string, any>} metaData - Additional descriptive information related to the virtual file.
 * @returns {VirtualFile} A constructed virtual file object.
 */
export function createVirtualFile(
  name: string,
  content: string,
  metaData: Record<string, any> = {}
): VirtualFile {
  return { type: "file", name, content, metaData };
}

/**
 * Creates a virtual folder with the given name and metadata.
 * @param {string}  name - The name of the virtual folder.
 * @param {Record<string, any>}  metaData - The metadata associated with the virtual folder, presented as key-value pairs.
 * @returns {VirtualFolder} The created virtual folder with specified name, empty items and associated metadata.
 */
export function createVirtualFolder(
  name: string,
  metaData: Record<string, any> = {}
): VirtualFolder {
  return { type: "folder", name, items: {}, metaData };
}

export class VirtualFileSystem {
  private readonly root: VirtualFolder;

  constructor({ root }: { root?: VirtualFolder } = {}) {
    (this as any)[immerable] = true;
    this.root = root || createVirtualFolder("");
  }

  createOrUpdateFile(
    path: string,
    content: string = "",
    metaData: Record<string, any> = {}
  ): VirtualFileSystem {
    try {
      return this.updateFile(path, content, metaData);
    } catch (error) {
      return this.createFile(path, content, metaData);
    }
  }

  createFile(
    path: string,
    content: string = "",
    metaData: Record<string, any> = {}
  ): VirtualFileSystem {
    /**
     * This method is used to produce a draft of the virtual file system and create a new virtual file within it.
     * If the file already exists in the given path, then it throws an error. 
     * If not, then it will create a new file with the given name, content, and metadata.
     * 
     * @param {String} path - The path in which the file or folder should be created.
     * @param {Object} content - The content of the new file to be created.
     * @param {Object} metaData - The metadata associated with the file to be created.
     * @returns {Object} The new state of the virtual file system after creating the new file.
     */
    return produce(this, (draft: VirtualFileSystem) => {
      const { parentFolder, name } = draft.getParentFolderAndName(path);
      if (parentFolder.items[name]) {
        throw new Error(
          `A file or folder with the name "${name}" already exists in the path "${path}".`
        );
      }
      parentFolder.items[name] = createVirtualFile(name, content, metaData);
    });
  }

  updateFile(
    path: string,
    content: string,
    metaData?: Record<string, any>
  ): VirtualFileSystem {
    /**
     * This method updates the file content and metadata in the virtual file system.
     * @param {string} path - The path to the file in the virtual file system.
     * @param {string} content - The new content to be written to the file.
     * @param {Object} metaData - The new metadata for the file. If null or undefined, the existing metadata is preserved.
     * @returns {VirtualFileSystem} The updated virtual file system.
     */
    return produce(this, (draft: VirtualFileSystem) => {
      const file = draft.getFile(path);
      file.content = content;
      file.metaData = metaData ?? file.metaData;
    });
  }

  delete(path: string): VirtualFileSystem {
    /**
     * Deletes a file from a virtual file system given its path. Checks if file exists and if it's a system file before deleting.
     * @param {string} path - The path of the file in the virtual file system.
     * @throws Will throw an error if the path does not exist or the file is a system file.
     * @returns {VirtualFileSystem} - Returns a draft of the virtual file system without the deleted file.
     */
    return produce(this, (draft: VirtualFileSystem) => {
      const { parentFolder, name } = draft.getParentFolderAndName(path);
      if (!parentFolder.items[name]) {
        throw new Error(`"${path}" does not exist.`);
      }
      if (parentFolder.items[name].metaData.isSystem) {
        throw new Error(`"${path}" is a system file and cannot be deleted.`);
      }
      delete parentFolder.items[name];
    });
  }

  createFolder(
    path: string,
    metaData: Record<string, any> = {}
  ): VirtualFileSystem {
    /**
     * This method is used to create a new virtual folder inside the parent folder. If a file or folder with the same name already exists, it will throw an error.
     * @param {Object} draft - An instance of VirtualFileSystem which will be modified.
     * @param {String} path - The path where the new virtual folder will be created.
     * @param {Object} metaData - Metadata for the new virtual folder.
     * @returns {Object} Returns an updated instance of the VirtualFileSystem with the new virtual folder added.
     */
    return produce(this, (draft: VirtualFileSystem) => {
      const { parentFolder, name } = draft.getParentFolderAndName(path);
      if (parentFolder.items[name]) {
        throw new Error(
          `A file or folder with the name "${name}" already exists in the path "${path}".`
        );
      }
      parentFolder.items[name] = createVirtualFolder(name, metaData);
    });
  }

  readFile(path: string): string {
    const file = this.getFile(path);
    return file.content;
  }

  listItems(path: string = ""): VirtualItem[] {
    const folder = this.getFolder(path);
    return Object.values(folder.items);
  }

  getItem(path: string): VirtualItem | null {
    const { parentFolder, name } = this.getParentFolderAndName(path);
    return parentFolder.items[name] ?? null;
  }

  private getFile(path: string): VirtualFile {
    const { parentFolder, name } = this.getParentFolderAndName(path);
    const file = parentFolder.items[name];
    if (!file || file.type !== "file") {
      throw new Error(`VirtualFile "${path}" does not exist.`);
    }
    return file;
  }

  getFolder(path: string): VirtualFolder {
    const parts = path.split("/").filter(Boolean);
    let currentFolder = this.root;
    for (const part of parts) {
      const nextFolder = currentFolder.items[part];
      if (!nextFolder || nextFolder.type !== "folder") {
        throw new Error(`Folder "${path}" does not exist.`);
      }
      currentFolder = nextFolder;
    }
    return currentFolder;
  }

  exists(path: string): boolean {
    try {
      return this.getItem(path) !== null;
    } catch (error) {
      return false;
    }
  }

  private getParentFolderAndName(path: string): {
    parentFolder: VirtualFolder;
    name: string;
  } {
    const parts = path.split("/").filter(Boolean);
    const name = parts.pop();
    if (!name) {
      throw new Error(`Invalid path "${path}".`);
    }
    const parentFolder = this.getFolder(parts.join("/"));
    return { parentFolder, name };
  }

  toJSON(): VirtualFolder {
    return this.root;
  }

  static fromJSON(data: VirtualFolder): VirtualFileSystem {
    return new VirtualFileSystem({ root: data });
  }
}
