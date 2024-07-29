import { VirtualFileSystem, VirtualFolder } from "./filesystem";

/**
 * Represents a suite of unit tests for the VirtualFileSystem class.
 *
 * The VirtualFileSystem class represents a virtual file system. Each method of the 
 * VirtualFileSystem class should be tested to ensure proper functionality. These methods 
 * include creating, updating, and deleting files and folders; checking the existence of 
 * files and folders; reading files; listing items in a folder; handling errors; and 
 * supporting serialization and deserialization to/from JSON.
 */
describe("VirtualFileSystem", () => {
  let vfs: VirtualFileSystem;

  /**
   * Setup method for tests. Instantiates a new VirtualFileSystem before each test.
   */
  beforeEach(() => {
    vfs = new VirtualFileSystem();
  });

  /**
   * This method is a test function that simulates the creation of a file and 
   * verifies its creation by reading and confirming its initial contents.
   * It doesn't take in any parameters nor return any specific values. 
   * However, it throws an error and fails the test when the file is not 
   * correctly created or the contents do not match the expected string.
   */
  test("should create a file", () => {
    vfs = vfs.createFile("test.txt", "Hello, World!");
    const content = vfs.readFile("test.txt");
    expect(content).toBe("Hello, World!");
  });

  /**
   * This is a test method that checks if the system throws an error when trying to create a file that already exists in the Virtual File System (VFS).
   */
  test("should throw error when creating a file that already exists", () => {
    vfs = vfs.createFile("test.txt", "Hello, World!");
    /**
     * This is a test method that will throw an error if 'createFile' method from 'vfs' library fails when attempting to create a file named 'test.txt'.
     */ 
    expect(() => vfs.createFile("test.txt")).toThrow(
      'A file or folder with the name "test.txt" already exists in the path "test.txt".'
    );
  });

  /**
   * This test method is intended to verify the functionality of file updating in the virtual file system (vfs). 
   * It first creates a file with initial content, then updates this content, and finally reads the content to ensure it has been updated correctly.
   * It does not have any parameters or return values as it is a testing function that captures test result via the 'expect' statement.
   */
  test("should update a file", () => {
    vfs = vfs.createFile("test.txt", "Hello, World!");
    vfs = vfs.updateFile("test.txt", "Updated content");
    const content = vfs.readFile("test.txt");
    expect(content).toBe("Updated content");
  });

  /**
   * This method tests the functionality of deleting a file in a virtual file system.
   * It first creates a file named "test.txt", deletes it and ensures that an error 
   * throws when attempting to read the deleted file.
   */
  test("should delete a file", () => {
    vfs = vfs.createFile("test.txt", "Hello, World!");
    vfs = vfs.delete("test.txt");
    /**
     * Tests whether vfs.readFile() throws an error when given "test.txt" as input.
     */
    expect(() => vfs.readFile("test.txt")).toThrow(
      'VirtualFile "test.txt" does not exist.'
    );
  });

  /**
   * Test function to assert if the 'createFolder' method correctly creates a folder.
   * No explicit parameters taken as inputs, they are specified within the function itself.
   * @returns {Array} A list of names of the items in the virtual file system,
   * checking to contain the created 'folder'.
   */
  
  test("should create a folder", () => {
    vfs = vfs.createFolder("folder");
    /**
     * This line of code obtains a list of items from the virtual file system (vfs) and maps these items into a new array containing only their names.
     * @returns {Array} An array containing the names of all items in the virtual file system.
     */
    const folders = vfs.listItems().map((item) => item.name);
    expect(folders).toContain("folder");
  });

  /**
   * Test method to check the error throwing functionality when attempting to create a folder that already exists.
   * This method might not take any parameters as it is a test function. The parameters and assets used are defined within the function.
   * @returns {void} Does not return anything but throws an error if a folder with the same name is created twice.
   */
  test("should throw error when creating a folder that already exists", () => {
    vfs = vfs.createFolder("folder");
    /**
     * Test method for vfs.createFolder. This method checks to see if an error is thrown when creating a new folder.
     * @param {string}  "folder" - The name of the folder to be created
     * @throws {Error} Will throw an error if the folder could not be created
     */
    expect(() => vfs.createFolder("folder")).toThrow(
      'A file or folder with the name "folder" already exists in the path "folder".'
    );
  });

  /**
   * This test case checks if the files in a folder are listed accurately. 
   * It creates a new folder and two files within that folder. 
   * It then maps each item in the folder to its name and compares this list with the expected file names.
   */
  test("should list files in a folder", () => {
    vfs = vfs.createFolder("folder");
    vfs = vfs.createFile("folder/file1.txt", "Content 1");
    vfs = vfs.createFile("folder/file2.txt", "Content 2");
    /**
     * Lists the names of all items in a given directory.
     * @param {string} "folder" - The name of the folder to list items from.
     * @returns {array} An array of strings, each representing the name of an item in the folder.
     */
    const files = vfs.listItems("folder").map((item) => item.name);
    expect(files).toEqual(["file1.txt", "file2.txt"]);
  });

  /**
   * Test to verify the functionality of listing all subfolders within a parent folder. 
   * It creates a virtual file system (vfs), adds a parent folder and two subfolders to it, 
   * then checks if the 'listItems' method accurately lists the subfolders.
   * @method
   * @name test
   * @param {none} No parameters.
   * @returns {void} This function does not return anything. It's a unit test function that throws an error if the outcomes of operations do not meet the expected results.
   */
  test("should list folders in a folder", () => {
    vfs = vfs.createFolder("folder");
    vfs = vfs.createFolder("folder/subfolder1");
    vfs = vfs.createFolder("folder/subfolder2");
    /**
     * Retrieves a list of names of items in the "folder" category using the vfs.listItems method.
     * @param {String} "folder" - The category of items to retrieve from vfs.
     * @returns {Array} An array containing the names of all items in the "folder" category.
     */
    const folders = vfs.listItems("folder").map((item) => item.name);
    expect(folders).toEqual(["subfolder1", "subfolder2"]);
  });

  /**
   * Test to ensure an error is thrown when attempting to write a file to a deeply nested path 
   * where some specified folders do not exist in the file structure.
   * @param {String} path - Includes the non existent folder structure followed by the filename.
   * @param {String} content - The content to be written into the file.
   * @returns {Exception} An error expressing that the folder structure does not exist.
   */
  test("should throw error when writing to a deeply nested path where some folders don't exist", () => {
    /**
     * This method creates a file in a virtual file system given a path and content.
     * @param {string} "nonexistent/folder/structure/test.txt" - The path where the file should be created.
     * @param {string} "Content" - The content to be written into the new file.
     * @returns {void} It does not return anything. It throws an error if the operation fails.
     */
    expect(() =>
      vfs.createFile("nonexistent/folder/structure/test.txt", "Content")
    ).toThrow('Folder "nonexistent/folder/structure" does not exist.');
  });

  /**
   * This is a test function to verify the behavior of the 'readFile' function from the 'vfs' module when trying to access a file from a non-existent deeply nested folder structure.
   * It is expected for an error to be thrown stating that the folder doesn't exist.
   */
  test("should throw error when reading a file from a deeply nested folder that doesn't exist", () => {
    /**
     * This is a test case for the vfs.readFile method. 
     * It checks if the method throws an error when trying to read a file from a non-existent directory.
     * @param {string} "nonexistent/folder/structure/test.txt" - The file path of the file to be read.
     * @returns {Error} Throws an error if the file path does not exist.
     */
    
    expect(() => vfs.readFile("nonexistent/folder/structure/test.txt")).toThrow(
      'Folder "nonexistent/folder/structure" does not exist.'
    );
  });

  /**
   * Test method to check the serialization of the file system to JSON format. It tests whether the given file structure (including folders, files, and content) is correctly transformed into a JSON object. This test makes use of the 'createFolder' and 'createFile' methods of the virtual file system, and checks the output of the 'toJSON' method.
   * No explicit parameters are given as input, and there's no explicit return from this function, as it is a Jest test case function.
   */
  test("should serialize the filesystem to JSON", () => {
    vfs = vfs.createFolder("folder");
    vfs = vfs.createFile("folder/file1.txt", "Content 1");
    vfs = vfs.createFile("folder/file2.txt", "Content 2");
    const json = vfs.toJSON();
    expect(json).toEqual({
      type: "folder",
      name: "",
      metaData: {},
      items: {
        folder: {
          type: "folder",
          name: "folder",
          metaData: {},
          items: {
            "file1.txt": {
              type: "file",
              name: "file1.txt",
              content: "Content 1",
              metaData: {},
            },
            "file2.txt": {
              type: "file",
              name: "file2.txt",
              content: "Content 2",
              metaData: {},
            },
          },
        },
      },
    });
  });

  /**
   * Test case for deserializing the filesystem from JSON. This test ensures that the folders and files 
   * are loaded correctly from the provided JSON structure.
   * @param {Object} json - A nested JSON object simulating the structure of a virtual filesystem, including folders and files.
   * @returns {Array} folders - An array containing the names of all folders deserialized from the JSON.
   * @returns {Array} files - An array containing the names of all files in the specified folder deserialized from the JSON.
   */
  test("should deserialize the filesystem from JSON", () => {
    const json: VirtualFolder = {
      type: "folder",
      name: "",
      metaData: {},
      items: {
        folder: {
          type: "folder",
          name: "folder",
          metaData: {},
          items: {
            "file1.txt": {
              type: "file",
              name: "file1.txt",
              content: "Content 1",
              metaData: {},
            },
            "file2.txt": {
              type: "file",
              name: "file2.txt",
              content: "Content 2",
              metaData: {},
            },
          },
        },
      },
    };
    const vfs = VirtualFileSystem.fromJSON(json);
    /**
     * This is a line of code that lists all item names from the virtual file system(vfs).
     * It does not explicitly define a function or method, but rather, maps over the list of items returned by vfs.listItems() function and return an array of item names.
     * This is typically a part of a larger code snippet, the context for which is not provided here. 
     * However, if we were to encapsulate this line of code into a function, the documentation would likely look something like this:
     */
    
    /**
     * Retrieves an array of names from a list of items in the virtual file system.
     * @param {Object[]} vfs - A virtual file system containing items.
     * @returns {String[]} An array of the names of the listed items in the vfs.
     */
    const folders = vfs.listItems().map((item) => item.name);
    /**
     * Maps the list of items from a provided folder and returns the names of each item.
     * @method files
     * @param {String}  "folder" - A string parameter representing the name of the folder to retrieve items from.
     * @returns {Array} An array containing the names of all items in the specified folder.
     */
    
    const files = vfs.listItems("folder").map((item) => item.name);
    expect(folders).toContain("folder");
    expect(files).toEqual(["file1.txt", "file2.txt"]);
    // No onWrite calls expected during deserialization
  });
});
