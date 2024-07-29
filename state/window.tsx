import { assert } from "@/lib/assert";
import { assertNever } from "@/lib/assertNever";
import { getDefaultStore } from "jotai";
import { atomFamily, atomWithReducer } from "jotai/utils";
import { programAtomFamily, programsAtom } from "./programs";

export type Program =
  | { type: "welcome" }
  | { type: "run" }
  | { type: "iframe"; programID: string; canSave?: boolean; canOpen?: boolean }
  | { type: "paint" }
  | { type: "help"; targetWindowID?: string }
  | {
      type: "explorer";
      currentPath?: string;
      action?: (path: string) => void;
      actionText?: string;
    };

export type WindowState = {
  status: "maximized" | "minimized" | "normal";
  pos: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number | "auto";
  };
  title: string;
  icon?: string;
  program: Program;
  id: string;
  loading: boolean;
};

export type WindowAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "TOGGLE_MAXIMIZE" }
  | { type: "TOGGLE_MINIMIZE" }
  | { type: "RESTORE" }
  | { type: "MOVE"; payload: { dx: number; dy: number } }
  | {
      type: "RESIZE";
      payload: {
        side:
          | "top"
          | "bottom"
          | "left"
          | "right"
          | "top-left"
          | "top-right"
          | "bottom-left"
          | "bottom-right";
        dx: number;
        dy: number;
      };
    }
  | {
      type: "INIT";
      payload: {
        title: string;
        program: WindowState["program"];
        id: string;
        loading?: boolean;
        size?: WindowState["size"];
        pos?: WindowState["pos"];
        icon?: string;
      };
    }
  | { type: "SET_ICON"; payload: string }
  | { type: "UPDATE_PROGRAM"; payload: Partial<WindowState["program"]> };

/**
 * Atom family that generates a unique atom state for each unique key. These states represent individual windows in a virtual operating system. Each window is generated with a unique ID and managed by a reducer function.
 * @param {string} id - Unique identifier for a window
 * @returns {object} Returns an atomWithReducer, which includes the status, position, size, title, program, id, and loading state of the window
 */
export const windowAtomFamily = atomFamily((id: string) => {
  return atomWithReducer(
    {
      status: "normal",
      pos: { x: 100, y: 100 },
      size: { width: 400, height: "auto" },
      title: "Welcome to Windows 9X",
      program: {
        type: "welcome",
      },
      id,
      loading: false,
    },
    windowReducer
  );
});

export const MIN_WINDOW_SIZE = { width: 300, height: 100 };

/**
 * This function is used to update the window size and ensures that it does not go below a certain size. It accepts an object with `width` and `height` attributes and returns a similar object.
 * @param {object} size - An object representing the size of the window, with properties `width` and `height`. The height could optionally be "auto", in which case it is left unchanged.
 * @returns {object} Returns an object with updated `width` and `height` values, ensuring the size does not go below a specified minimum (MIN_WINDOW_SIZE).
 */
function clampSize(size: WindowState["size"]): WindowState["size"] {
  return {
    width: Math.max(size.width, MIN_WINDOW_SIZE.width),
    height:
      size.height === "auto"
        ? "auto"
        : Math.max(size.height, MIN_WINDOW_SIZE.height),
  };
}

/**
 * Reducer function to manage application window states such as toggling maximized or minimized window, moving window, 
 * restoring normal mode, initializing window, resizing window, loading status, changing icon, and updating program.
 * @param {WindowState}  state - The current state of the window.
 * @param {WindowAction}  action - The action to be performed on the window state.
 * @returns {WindowState} Updated state after performing given action.
 */
function windowReducer(state: WindowState, action: WindowAction): WindowState {
  switch (action.type) {
    case "TOGGLE_MAXIMIZE":
      return {
        ...state,
        status: state.status === "maximized" ? "normal" : "maximized",
      };
    case "TOGGLE_MINIMIZE":
      return {
        ...state,
        status: state.status === "minimized" ? "normal" : "minimized",
      };
    case "MOVE":
      if (state.status === "maximized" || state.status === "minimized") {
        return state;
      }
      return {
        ...state,
        pos: {
          x: state.pos.x + action.payload.dx,
          y: state.pos.y + action.payload.dy,
        },
      };
    case "RESTORE":
      return { ...state, status: "normal" };
    case "INIT":
      return { ...state, ...action.payload };
    case "RESIZE":
      const newState = handleResize(state, action);
      return {
        ...newState,
        size: clampSize(newState.size),
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ICON":
      return { ...state, icon: action.payload };
    case "UPDATE_PROGRAM":
      return {
        ...state,
        program: { ...state.program, ...action.payload } as any,
      };
    default:
      assertNever(action);
  }

  return state;
}

/**
 * This function handles the "RESIZE" event and updates the state based on the action payload.
 * Following cases of window resizing from top, bottom, left, right and subcases of resizing corners are covered.
 * Depending on the side of window getting resize, corresponding height and width in state gets updated.
 * Window's X and Y position might also get adjusted during the process as needed.
 *
 * @param {Object} state - The initial state of the window containing its size and position. 
 * The size object has two properties; width and height while the position object has two properties; x and y.
 *
 * @param {Object} action - The action object which fires off the window resize. 
 * This includes a type property to indicate type of event and a payload property which indicates the side of window being resized and by how much (dx, dy).
 *
 * @returns {Object} This returns a new state as a result of window resize event.
 * The return state includes updated size and possibly position of window after the resize action.
 */
function handleResize(state: WindowState, action: WindowAction) {
  if (action.type !== "RESIZE") {
    return state;
  }

  switch (action.payload.side) {
    case "top": {
      const delta = -action.payload.dy;
      return {
        ...state,
        size: {
          ...state.size,
          height:
            (state.size.height === "auto" ? 0 : state.size.height) + delta,
        },
        pos: {
          ...state.pos,
          y: state.pos.y - delta,
        },
      };
    }

    case "bottom": {
      const delta = action.payload.dy;
      return {
        ...state,
        size: {
          ...state.size,
          height:
            (state.size.height === "auto" ? 0 : state.size.height) + delta,
        },
      };
    }
    case "left": {
      const delta = -action.payload.dx;
      return {
        ...state,
        size: {
          ...state.size,
          width: state.size.width + delta,
        },
        pos: {
          ...state.pos,
          x: state.pos.x - delta,
        },
      };
    }
    case "right": {
      const delta = action.payload.dx;
      return {
        ...state,
        size: {
          ...state.size,
          width: state.size.width + delta,
        },
      };
    }
    case "bottom-right": {
      const { dx, dy } = action.payload;
      return {
        ...state,
        size: {
          ...state.size,
          width: state.size.width + dx,
          height: (state.size.height === "auto" ? 0 : state.size.height) + dy,
        },
      };
    }
    case "top-right": {
      const dx = action.payload.dx;
      const dy = -action.payload.dy;
      return {
        ...state,
        size: {
          ...state.size,
          width: state.size.width + dx,
          height: (state.size.height === "auto" ? 0 : state.size.height) + dy,
        },
        pos: {
          ...state.pos,
          y: state.pos.y - dy,
        },
      };
    }
    case "bottom-left": {
      const dx = -action.payload.dx;
      const dy = action.payload.dy;
      return {
        ...state,
        size: {
          ...state.size,
          width: state.size.width + dx,
          height: (state.size.height === "auto" ? 0 : state.size.height) + dy,
        },
        pos: {
          ...state.pos,
          x: state.pos.x - dx,
        },
      };
    }
    case "top-left": {
      const dx = -action.payload.dx;
      const dy = -action.payload.dy;
      return {
        ...state,
        size: {
          ...state.size,
          width: state.size.width + dx,
          height: (state.size.height === "auto" ? 0 : state.size.height) + dy,
        },
        pos: {
          ...state.pos,
          x: state.pos.x - dx,
          y: state.pos.y - dy,
        },
      };
    }
  }
}

/**
 * Concatenates a provided id with the string 'iframe-' to create a unique iframe ID.
 * @param {string}  id - The unique identifier to be used in concatenation.
 * @returns {string} The unique iframe ID.
 */

export function getIframeID(id: string) {
  return `iframe-${id}`;
}

/**
 * Reloads the specified iframe by id. This function retrieves the default store, gets the window atom family of the provided id, checks if the window is an iframe, and gets the program atom family of the programID. An error is thrown if the program isn't found. The function then sets the programsAtom with an UPDATE_PROGRAM action, resetting the code to undefined. Finally, it retrieves the iframe using the given id and reloads it if it exists.
 * @param {string}  id - The id of the iframe to reload.
 */

export function reloadIframe(id: string) {
  const store = getDefaultStore();
  const window = store.get(windowAtomFamily(id));
  assert(window.program.type === "iframe", "Window is not an iframe");
  const program = store.get(programAtomFamily(window.program.programID));
  assert(program, "Program not found");

  store.set(programsAtom, {
    type: "UPDATE_PROGRAM",
    payload: { id: program.id, code: undefined },
  });

  const iframe = getIframe(id);
  if (iframe) {
    iframe.contentWindow?.location.reload();
  }
}

/**
 * Retrieves an iframe from the document based on the provided id. 
 * It constructs an element id from the provided id and attempts 
 * to retrieve the corresponding iframe from the document.
 * In case no matching iframe is found, returns null.
 *
 * @param {string} id - The id of the desired iframe element
 * @returns {HTMLIFrameElement | null} Either the found HTMLIFrameElement or null if no such element exists.
 */
export function getIframe(id: string): HTMLIFrameElement | null {
  return document.getElementById(getIframeID(id)) as HTMLIFrameElement | null;
}
