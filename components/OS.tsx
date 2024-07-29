"use client";

import styles from "./OS.module.css";
import cx from "classnames";
import { getDefaultStore, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { focusedWindowAtom } from "@/state/focusedWindow";
import { windowsListAtom } from "@/state/windowsList";
import { windowAtomFamily } from "@/state/window";
import { createWindow } from "@/lib/createWindow";
import { Window } from "./Window";
import { startMenuOpenAtom } from "@/state/startMenu";
import { Desktop } from "./Desktop";
import { DESKTOP_URL_KEY, registryAtom } from "@/state/registry";
import { ContextMenu } from "./ContextMenu";

/**
 * This is a React function component that renders the Operating System User Interface including Desktop, 
 * TaskBar, Windows and Context Menu as well as the wallpaper. It also handles events for focusing or 
 * unfocusing a window based on the user's mouse events.
 * @param {None} None - This function takes no arguments.
 * @returns {React Component} A react component depicting the Operating System's UI and handling window focus events.
 */
export function OS() {
  const [windows] = useAtom(windowsListAtom);
  const setFocusedWindow = useSetAtom(focusedWindowAtom);
  const registry = useAtomValue(registryAtom);

  const publicDesktopUrl = registry[DESKTOP_URL_KEY] ?? "/bg.jpg";

  /**
   * Listens for mousedown event on the window. When a mousedown event occurs, this function checks if the event originated from one of the designated windows. If yes, it focuses on that window; if not, it removes focus from the currently focused window. It also ensures to close the "start menu" whenever a mousedown event occurs.
   * The useEffect hook ensures that this listener is setup once after the component's initial render, and is cleanup up before unmounted and on subsequent renders. It also runs the effect whenever 'windows' or 'setFocusedWindow' props change.
   * @param {MouseEvent} e - The mouse event object
   * @returns {Undefined} It doesn't return anything.
   */
  
  useEffect(() => {
    /**
     * Handles an onMouseDown event from a user's interaction, and sets the focused window based on the event target.
     * @param {MouseEvent} e - The event triggered by the user's mouse down action.
     * @returns {void} This method does not return anything.
     */
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      getDefaultStore().set(startMenuOpenAtom, false);
      /**
       * This method finds the ID of a window element that contains a specific target.
       * @param {Array} windows - An array of window IDs.
       * @param {HTMLElement} target - The target HTML element to check whether it is contained in the window element.
       * @returns {String|null} Returns the ID of the window element that contains the target element, or null if none of the window elements contains the target.
       */
      const windowID = windows.find((windowId) => {
        const windowElement = document.getElementById(windowId);
        return windowElement && windowElement.contains(target);
      });
      if (windowID) {
        setFocusedWindow(windowID);
      } else {
        setFocusedWindow(null);
      }
    };
    window.addEventListener("mousedown", onMouseDown);
    /**
     * An anonymous function that removes an event listener for "mousedown" events on the window object.
     * @returns {Function} An anonymous function that when called, removes the "mousedown" event listener from the window object.
     */
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [windows, setFocusedWindow]);
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
        backgroundImage: `url(${publicDesktopUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
      }}
      /**
       * This is an event handler for the 'onContextMenu' event. 
       * It prevents the default context menu from appearing when right-clicking on the element.
       * @param {Object} e - the event object, which contains information about what triggered the event
       * @returns {undefined} No explicit return value
       */
      
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <Desktop />
      /**
       * This is a functional component that maps over an array of window IDs, generating a 'Window' component for each one.
       * @param {Array}  windows - An array of window IDs.
       * @returns {ReactElement} Returns an array of 'Window' components, each with a unique key and id prop.
       */
      
      {windows.map((id) => (
        <Window key={id} id={id} />
      ))}

      <TaskBar />
      <ContextMenu />
    </div>
  );
}

/**
 * TaskBar is a React Component that renders the taskbar and its components. It includes the start button, 
 * the start menu when it's open, a divider, and a list of open windows.
 * There are no parameters for this function as hooks are used to fetch necessary data.
 * @returns {JSX.Element} A React component.
 */
function TaskBar() {
  const windows = useAtomValue(windowsListAtom);
  const [startMenuOpen, setStartMenuOpen] = useAtom(startMenuOpenAtom);
  return (
    <div className={cx("window", styles.taskbar)}>
      <button
        className={styles.startButton}
        /**
         * A function that toggles the state of 'startMenuOpen' between true and false upon a click event.
         * @returns {undefined} This function does not have a return value.
         */
        /**
         * A method that toggles the state of the 'startMenuOpen' variable. 
         * There are no params since the function uses the current state to set a new one.
         * @returns {void} This function does not have a return value
         */
        onClick={() => setStartMenuOpen((v) => !v)}
      >
        Start
      </button>
      {startMenuOpen && <StartMenu />}
      <div className={styles.divider}></div>
      /**
       * It loops over all the items in the 'windows' array and renders the 'WindowTaskBarItem' component for each item. 
       * Each 'WindowTaskBarItem' component will receive an unique 'id' as a 'key' and 'id' prop.
       * @param {Array} windows - An array of unique id(s) for each window. 
       * @returns {<ReactElement[]>} An array of 'WindowTaskBarItem' components.
       */
      {windows.map((id) => (
        <WindowTaskBarItem key={id} id={id} />
      ))}
    </div>
  );
}

/**
 * Render the start Menu component with multiple button components.
 * Each button creates a new window with a unique title and program when clicked.
 */
function StartMenu() {
  return (
    <div className={cx("window", styles.startMenu)}>
      <button
        /**
         * Triggers the creation of a new window with specific properties when a mouse button is pressed.
         * @param {Object} event - Mouse event.
         */
        onMouseDown={() => {
          createWindow({
            title: "Welcome to Windows 9X",
            program: { type: "welcome" },
          });
        }}
      >
        Welcome
      </button>
      <button
        /**
         * This is the action handler for Mouse Down event. On invoking this event, it creates and opens a new window 
         * with given configuration, including the window's title name and the type of program to run.
         */
        onMouseDown={() => {
          createWindow({
            title: "Run",
            program: { type: "run" },
          });
        }}
      >
        Run
      </button>
      {/* <button
        onMouseDown={() => {
          createWindow({
            title: "Paint",
            program: { type: "paint" },
          });
        }}
      >
        Paint
      </button> */}
      <button
        /**
         * Handles the mouse down event which triggers the creation of a new window object with the defined properties.
         */
        onMouseDown={() => {
          createWindow({
            title: "Explorer",
            program: { type: "explorer" },
          });
        }}
      >
        Explorer
      </button>
    </div>
  );
}

/**
 * React component that creates a taskbar item for each window in the application.
 * The component then uses React states and atoms to control the focusedWindow and window state.
 * @param {{id: string}}  id - The ID of the window.
 * Returns a button element that represents the window on the taskbar with several states and styles.
 * On clicking the button, the window gets focused and if it was minimized, it gets restored.
 * @returns {ReactElement} Button element representing the window taskbar item.
 */
function WindowTaskBarItem({ id }: { id: string }) {
  const [focusedWindow, setFocusedWindow] = useAtom(focusedWindowAtom);
  const [state, dispatch] = useAtom(windowAtomFamily(id));
  return (
    <button
      key={id}
      className={cx(styles.windowButton, {
        [styles.active]: focusedWindow === id,
      })}
      /**
       * Handles the click event on the window. Stops event propagation, sets the focused window to the current id and, if the window is minimized, restores it.
       * @param {Event}  e - Target event from the click interaction
       */
      
      onClick={(e) => {
        e.stopPropagation();
        setFocusedWindow(id);
        if (state.status === "minimized") {
          dispatch({ type: "RESTORE" });
        }
      }}
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "256px",
      }}
    >
      {state.title}
    </button>
  );
}
