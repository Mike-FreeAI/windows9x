"use client";

import cx from "classnames";
import {
  atom,
  getDefaultStore,
  useAtom,
  useAtomValue,
  useSetAtom,
} from "jotai";
import { focusedWindowAtom } from "@/state/focusedWindow";
import { windowsListAtom } from "@/state/windowsList";
import { MIN_WINDOW_SIZE, windowAtomFamily } from "@/state/window";
import { WindowBody } from "./WindowBody";
import styles from "./Window.module.css";
import { MouseEventHandler, MouseEvent as ReactMouseEvent } from "react";
import Image from "next/image";
import { createWindow } from "@/lib/createWindow";
import { WindowMenuBar } from "./WindowMenuBar";

const isResizingAtom = atom(false);

/**
 * A render function for a window UI component. This window component is capable of resizing, focusing, minimizing, maximizing, and restoring actions.
 * It respects the state of the window (e.g., size, position, status, and title) and can respond to mouse events for moving and resizing the window.
 * 
 * @param {{ id: string }} params - An object containing window identification.
 * @param {string} params.id - A unique identifier for the window.
 * 
 * @returns {JSX.Element} A JSX element that represents a window UI component.
 */
export function Window({ id }: { id: string }) {
  const [state, dispatch] = useAtom(windowAtomFamily(id));
  const windowsDispatch = useSetAtom(windowsListAtom);
  const [focusedWindow, setFocusedWindow] = useAtom(focusedWindowAtom);
  const isResizing = useAtomValue(isResizingAtom);

  return (
    <div
      className={cx("window", {
        [styles.jiggle]: state.loading,
      })}
      id={id}
      style={{
        position: "absolute",
        top: state.loading ? state.pos.y : 0,
        left: state.loading ? state.pos.x : 0,
        width: state.status === "maximized" ? "100%" : state.size.width,
        height: state.status === "maximized" ? "100%" : state.size.height,
        transform:
          state.status === "maximized"
            ? "none"
            : `translate(${state.pos.x}px, ${state.pos.y}px)`,
        display: state.status === "minimized" ? "none" : "flex",
        flexDirection: "column",
        zIndex: focusedWindow === id ? 1 : 0,
        isolation: "isolate",
        minWidth: MIN_WINDOW_SIZE.width,
        minHeight: MIN_WINDOW_SIZE.height,
      }}
    >
      <div
        className={cx("title-bar", {
          inactive: focusedWindow !== id,
        })}
        onMouseDown={createResizeEvent(
          /**
           * This method dispatches a "MOVE" action to the reducer with a payload of change in x and y coordinates.
           * @param {_e: MouseEvent} - The MouseEvent object that initiated the move event.
           * @param {delta: { x: number; y: number }} - An object containing the change in x and y coordinates.
           * @returns {void} This method does not return anything.
           */
          (_e: MouseEvent, delta: { x: number; y: number }) => {
            dispatch({
              type: "MOVE",
              payload: { dx: delta.x, dy: delta.y },
            });
          }
        )}
      >
        <div
          className={styles.title}
          style={{
            overflow: "hidden",
          }}
        >
          {state.icon && (
            <Image src={state.icon} alt={state.title} width={16} height={16} />
          )}
          <div
            className="title-bar-text"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {state.title}
          </div>
        </div>
        <div className="title-bar-controls">
          {state.program.type !== "iframe" ? null : (
            <button
              aria-label="Help"
              style={{
                marginRight: 2,
              }}
              /**
               * Handles click event to create a new window.
               * @param {Object} WindowOptions - A configuration object for the new window.
               * @param {string} WindowOptions.title - Title of the new window.
               * @param {Object} WindowOptions.program - Program associated with the window.
               * @param {string} WindowOptions.program.type - Type of program to be run on the window.
               * @param {number} WindowOptions.program.targetWindowID - The ID of the target window.
               * @returns {void} No return value.
               */
              onClick={() =>
                createWindow({
                  title: "Help",
                  program: { type: "help", targetWindowID: id },
                })
              }
            ></button>
          )}
          <button
            aria-label="Minimize"
            /**
             * An onClick event handler function that dispatches "TOGGLE_MINIMIZE" action and clears the focused window if it equals to the current window id.
             * No explicit parameters are passed to this function but it uses some global variables like dispatch, focusedWindow, setFocusedWindow, and id from the surrounding scope.
             * @returns {undefined} This function does not explicitly return anything.
             */
            onClick={() => {
              dispatch({ type: "TOGGLE_MINIMIZE" });
              if (focusedWindow === id) {
                setFocusedWindow(null);
              }
            }}
          ></button>
          <button
            aria-label={state.status === "maximized" ? "Restore" : "Maximize"}
            /**
             * Handles the click event which dispatches an action to toggle the maximize state in the application. 
             */
            onClick={() => dispatch({ type: "TOGGLE_MAXIMIZE" })}
          ></button>
          <button
            aria-label="Close"
            style={{
              marginLeft: 0,
            }}
            /**
             * Handles the click event which triggers the dispatch of an action to remove a specific window.
             * @param {none} - This function does not accept any parameters. 
             * @returns {void} - It does not return any value.
             */
            onClick={() => windowsDispatch({ type: "REMOVE", payload: id })}
          ></button>
        </div>
      </div>

      <div
        className="window-body"
        style={{
          flex: 1,
          pointerEvents: isResizing ? "none" : "auto",
          overflow: "hidden",
          marginTop: state.program.type === "iframe" ? 0 : undefined,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <WindowMenuBar id={id} />
        <WindowBody state={state} />
      </div>
      {/* right side */}
      <div
        style={{
          top: 0,
          right: -4,
          bottom: 0,
          position: "absolute",
          width: 7,
          cursor: "ew-resize",
        }}
        onMouseDown={createResizeEvent(
          /**
           * This method is an event handler that resizes an element when a MouseEvent occurs. 
           * It dispatches an action to the redux store with type "RESIZE" and payload containing the side to resize and the change in x and y coordinates.
           * @param {_e: MouseEvent} _e - The mouse event that triggered the resize.
           * @param {Object} delta - An object containing x and y coordinate.
           * @param {number} delta.x - The change in the x-coordinate during the resize.
           * @param {number} delta.y - The change in the y-coordinate during the resize.
           * @returns {void} No return value.
           */
          (_e: MouseEvent, delta: { x: number; y: number }) => {
            dispatch({
              type: "RESIZE",
              payload: { side: "right", dx: delta.x, dy: delta.y },
            });
          }
        )}
      ></div>
      {/* left side */}
      <div
        style={{
          top: 0,
          left: -4,
          bottom: 0,
          position: "absolute",
          width: 7,
          cursor: "ew-resize",
        }}
        onMouseDown={createResizeEvent(
          /**
           * Handles a mouse event to resize a UI widget on left side according to the change in x, y coordinates.
           * @param {MouseEvent}  _e - The mouse event.
           * @param {Object} delta - An object that represents change in x and y coordinates.
           * @param {number} delta.x - The change in x coordinate.
           * @param {number} delta.y - The change in y coordinate.
           * @returns {void} This function does not return a value, it dispatches a RESIZE action with payload containing the side and changes in coordinates.
           */
          (_e: MouseEvent, delta: { x: number; y: number }) => {
            dispatch({
              type: "RESIZE",
              payload: { side: "left", dx: delta.x, dy: delta.y },
            });
          }
        )}
      ></div>
      {/* bottom side */}
      <div
        style={{
          left: 0,
          right: 0,
          bottom: -4,
          position: "absolute",
          height: 7,
          cursor: "ns-resize",
        }}
        onMouseDown={createResizeEvent(
          /**
           * Method to handle mouse event and dispatch resizing type event with delta values.
           * @param {_e:MouseEvent} _e - The MouseEvent object that provides data on the mouse event.
           * @param {Object} delta - An object containing the x and y values of the delta.
           * @param {number} delta.x - The change in x direction.
           * @param {number} delta.y - The change in y direction.
           * @returns {void} This method does not return anything.
           */
          (_e: MouseEvent, delta: { x: number; y: number }) => {
            dispatch({
              type: "RESIZE",
              payload: { side: "bottom", dx: delta.x, dy: delta.y },
            });
          }
        )}
      ></div>
      {/* top side */}
      <div
        style={{
          top: -4,
          left: 0,
          right: 0,
          position: "absolute",
          height: 7,
          cursor: "ns-resize",
        }}
        onMouseDown={createResizeEvent(
          /**
           * Handles mouse event and dispatches a resize action.
           * @param {_e: MouseEvent}  _e - The mouse event.
           * @param {delta: Object}  delta - An object that holds the x and y numeric coordinates.
           * @returns {undefined} Dispatches an action of type "RESIZE" and does not return a value.
           */
          (_e: MouseEvent, delta: { x: number; y: number }) => {
            dispatch({
              type: "RESIZE",
              payload: { side: "top", dx: delta.x, dy: delta.y },
            });
          }
        )}
      ></div>
      {/* top left */}
      <div
        style={{
          top: -4,
          left: -4,
          position: "absolute",
          width: 7,
          height: 7,
          cursor: "nwse-resize",
        }}
        onMouseDown={createResizeEvent(
          /**
           * Handles the resizing action for top-left direction
           * @param {_e: MouseEvent} _e - The Mouse Event object
           * @param {delta: { x: number; y: number }} delta - An object that contains the delta changes of the x and y coordinates
           * @returns {void} This function does not have a return
           */
          (_e: MouseEvent, delta: { x: number; y: number }) => {
            dispatch({
              type: "RESIZE",
              payload: { side: "top-left", dx: delta.x, dy: delta.y },
            });
          }
        )}
      ></div>
      {/* top right */}
      <div
        style={{
          top: -4,
          right: -4,
          position: "absolute",
          width: 7,
          height: 7,
          cursor: "nesw-resize",
        }}
        onMouseDown={createResizeEvent(
          /**
           * Handles mouse event and dispatches a resize action.
           * @param {_e: MouseEvent} _e - An object representing the mouse event.
           * @param {delta: {x:number, y:number}} delta - An object holding 'x' and 'y' as deltas for the resize.
           * @returns {void} - This function does not have a return value, it performs an action (dispatches an action).
           */
          (_e: MouseEvent, delta: { x: number; y: number }) => {
            dispatch({
              type: "RESIZE",
              payload: { side: "top-right", dx: delta.x, dy: delta.y },
            });
          }
        )}
      ></div>
      {/* bottom left */}
      <div
        style={{
          bottom: -4,
          left: -4,
          position: "absolute",
          width: 7,
          height: 7,
          cursor: "nesw-resize",
        }}
        onMouseDown={createResizeEvent(
          /**
           * This function handles the resizing event of an object in the dimensions of bottom-left side. 
           * It dispatches an action of type "RESIZE" along with the changes in x and y dimensions as payload.
           * @param {_e: MouseEvent}  _e - The mouse event that triggers this function execution.
           * @param {Object} delta - An object that contains the changes in x and y dimensions.
           * @param {number} delta.x - The change in x-dimension.
           * @param {number} delta.y - The change in y-dimension.
           * @returns {void} This function does not return anything.
           */
          (_e: MouseEvent, delta: { x: number; y: number }) => {
            dispatch({
              type: "RESIZE",
              payload: { side: "bottom-left", dx: delta.x, dy: delta.y },
            });
          }
        )}
      ></div>
      {/* bottom right */}
      <div
        style={{
          bottom: -4,
          right: -4,
          position: "absolute",
          width: 7,
          height: 7,
          cursor: "nwse-resize",
        }}
        onMouseDown={createResizeEvent(
          /**
           * Event handler that dispatches an action to resize an element from the bottom-right side when a mouse event occurs.
           * @param {_e: MouseEvent}  - The mouse event object.
           * @param {delta: Object} delta - An object containing the 'x' and 'y' coordinates of the changes applied to the element's dimensions.
           * @returns {undefined} This function does not return anything.
           */
          (_e: MouseEvent, delta: { x: number; y: number }) => {
            dispatch({
              type: "RESIZE",
              payload: {
                side: "bottom-right",
                dx: delta.x,
                dy: delta.y,
              },
            });
          }
        )}
      ></div>
    </div>
  );
}

/**
 * This method creates a custom mouse event handler that can carry out a given function (callback) 
 * upon receiving a resize event, while tracking the changes (delta) in the x and y coordinates.
 * @param {(e: MouseEvent, delta: { x: number; y: number }) => void}  cb - This parameter is the callback function to be executed when the mouse move event occurs.  
 * The callback function takes two parameters; a MouseEvent object, and an object (delta) containing the changes in
 * the x and y coordinates of the mouse cursor.
 * @returns {MouseEventHandler<T>} The method returns a MouseEventHandler, that has been enhanced to carry out the callback function upon a mouse move event, and to 
 * stop executing the callback function on mouse up or a window blur event.
 */
function createResizeEvent<T>(
  cb: (e: MouseEvent, delta: { x: number; y: number }) => void
): MouseEventHandler<T> {
  /**
   * Function that sets up and handles the necessary event listeners for resizing functionality.
   * @param {ReactMouseEvent<T>}  e - React mouse event object which includes the initial client mouse coordinates.
   * @returns {function} Function that sets up and manages mouse move and mouse up events and changes the resizing state in the default store.
   */
  return (e: ReactMouseEvent<T>) => {
    let last = { x: e.clientX, y: e.clientY };
    /**
     * Handles the movement of the mouse cursor and gets the change in x and y coordinates.
     * @param {MouseEvent}  e - Mouse event that includes the current mouse coordinates.
     * @returns {undefined} Does not return any value, but performs an action based on the callback function, 'cb'.
     */
    const handleMouseMove = (e: MouseEvent) => {
      const delta = { x: e.clientX - last.x, y: e.clientY - last.y };
      cb(e, delta);
      last = { x: e.clientX, y: e.clientY };
    };
    getDefaultStore().set(isResizingAtom, true);
    /**
     * Handles 'mouseup' event. Removes the added events: 'mousemove', 'mouseup' and 'blur' from the window and sets 'isResizingAtom' to false in the default store.
     */
    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleMouseUp);
      getDefaultStore().set(isResizingAtom, false);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", handleMouseUp);
  };
}
