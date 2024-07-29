import { getDefaultStore, useAtom, useSetAtom } from "jotai";
import { MenuBar } from "./MenuBar";
import { getIframe, reloadIframe, windowAtomFamily } from "@/state/window";
import { windowsListAtom } from "@/state/windowsList";
import { createWindow } from "@/lib/createWindow";
import { fileSystemAtom } from "@/state/filesystem";
import { getParentPath, lastVisitedPathAtom } from "@/state/lastVisitedPath";

/**
 * Function that creates a menu bar for a window in the application. The menu bar includes options for file handling (reload, save, open, close) based on the state of the program within the window.
 * @param {{ id: string }} object - An object that contains a string `id` that uniquely identifies the window in which the menu bar should be created.
 * @returns {JSX.Element|null} A `MenuBar` React component that contains the menu bar options or null if the state program is not of type `iframe`.
 */
export function WindowMenuBar({ id }: { id: string }) {
  const [state] = useAtom(windowAtomFamily(id));
  const windowsDispatch = useSetAtom(windowsListAtom);
  const [_, setFileSystem] = useAtom(fileSystemAtom);

  if (state.program.type !== "iframe") return null;

  return (
    <MenuBar
      options={[
        {
          label: "File",
          items: [
            state.program.type === "iframe"
              ? {
                  label: "Reload",
                  /**
                   * Method to handle click event and trigger iframe reload based on provided id.
                   * @param {string} id - The id of the iframe to be reloaded.
                   */
                  onClick: () => reloadIframe(id),
                }
              : null,
            state.program.canSave
              ? {
                  label: "Save",
                  /**
                   * Handles onClick event that initiates a save operation.
                   * This function performs several tasks, including getting the default store, handling a save completion, creating a window and finally initiating the save operation by triggering a "postMessage" call.
                   * @param {No parameters} No parameters - This function doesn't accept any parameters.
                   * @returns {No return values} No return - This function doesn't return any values.
                   */
                  onClick: () => {
                    const store = getDefaultStore();
                    const iframe = getIframe(id)!;
                    /**
                     * Handles the event of message 'saveComplete'. It removes listener on 'message', creates a new save window and updates the file system.
                     * @param {MessageEvent}  event - Message Event fired by postMessage, having data about operation type and content.
                     */
                    
                    const handleSaveComplete = (event: MessageEvent) => {
                      if (event.data.operation === "saveComplete") {
                        window.removeEventListener(
                          "message",
                          handleSaveComplete
                        );

                        const content = event.data.content;
                        const lastVisitedPath = store.get(lastVisitedPathAtom);
                        const fs = store.get(fileSystemAtom);
                        createWindow({
                          title: "Save",
                          program: {
                            type: "explorer",
                            currentPath:
                              lastVisitedPath && fs.exists(lastVisitedPath)
                                ? lastVisitedPath
                                : undefined,
                            actionText: "Save",
                            /**
                             * Initiates an action to create or update a file in the file system and, simultaneously, set the last visited path in the storage.
                             * @param {string}  path - The path where the file needs to be created or updated.
                             */
                            action: (path) => {
                              /**
                               * Sets the file system and initiates file creation or update based on the provided path and content.
                               * @param {Function} fs - A function representing the file system to be set.
                               * @returns {Promise} Returns a promise that will be resolved when the file creation or update process is completed.
                               */
                              setFileSystem((fs) =>
                                fs.createOrUpdateFile(path, content)
                              );
                              store.set(
                                lastVisitedPathAtom,
                                getParentPath(path)
                              );
                            },
                          },
                        });
                      }
                    };

                    window.addEventListener("message", handleSaveComplete);

                    iframe.contentWindow?.postMessage({
                      operation: "save",
                    });
                  },
                }
              : null,
            state.program.canOpen
              ? {
                  label: "Open",
                  /**
                   * Handles onClick event by opening a new window with the file explorer. 
                   * Reads content from the last visited path if it exists, sends an 'open' operation and file content to an iframe and updates the last visited path.
                   * 
                   * @returns {void} Does not return anything.
                   */
                  onClick: () => {
                    const store = getDefaultStore();
                    const lastVisitedPath = store.get(lastVisitedPathAtom);
                    const fs = store.get(fileSystemAtom);
                    createWindow({
                      title: "Open",
                      program: {
                        type: "explorer",
                        actionText: "Open",
                        currentPath:
                          lastVisitedPath && fs.exists(lastVisitedPath)
                            ? lastVisitedPath
                            : undefined,
                        /**
                         * This method allows to perform an action on a specific path in the File System. It reads the file from the path,
                         * retrieves iframe using the provided id and then posts a message to open and display the file's content.
                         * It also updates the lastVisitedPathAtom state with the parent path of the given path.
                         * @param {String}  path - The path of the file in the File System that we are trying to access.
                         */
                        action: (path) => {
                          const fs = store.get(fileSystemAtom);
                          const file = fs.readFile(path);
                          const iframe = getIframe(id)!;
                          store.set(lastVisitedPathAtom, getParentPath(path));
                          iframe.contentWindow?.postMessage({
                            operation: "open",
                            content: file,
                          });
                        },
                      },
                    });
                  },
                }
              : null,
            {
              label: "Close",
              /**
               * Handles the click event to remove a window.
               * Dispatches an action of type "REMOVE" with the specified id payload 
               * to the windows dispatcher.
               */
              onClick: () => {
                windowsDispatch({ type: "REMOVE", payload: id });
              },
            },
          ],
        },
      ]}
    />
  );
}
