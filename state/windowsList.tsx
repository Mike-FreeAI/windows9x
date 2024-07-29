import { assertNever } from "@/lib/assertNever";
import { atomWithReducer } from "jotai/utils";

export type WindowsListState = string[];

export type WindowsListAction =
  | { type: "ADD"; payload: string }
  | { type: "REMOVE"; payload: string };

export const windowsListAtom = atomWithReducer(
  ["window1"],
  /**
   * This function manages the state of a Windows List based on the given action. It can "ADD" a new window
   * to the list or "REMOVE" an existing window from the list.
   * @param {WindowsListState} state - Current state of the Windows list
   * @param {WindowsListAction} action - An object containing the action type ("ADD" or "REMOVE") and payload (window ID).
   * @returns {WindowsListState} A new WindowsListState that represents the updated state of the windows list.
   */
  (state: WindowsListState, action: WindowsListAction): WindowsListState => {
    switch (action.type) {
      case "ADD":
        return [...state, action.payload];
      case "REMOVE":
        /**
         * Filters the state array to exclude the action payload.
         * @param {Array}  state - Current state array.
         * @param {Object}  action - Received action object having payload property which needs to be excluded.
         * @returns {Array} New filtered state array, excluding the action's payload.
         */
        return state.filter((id) => id !== action.payload);
      default:
        assertNever(action);
    }
    return state;
  }
);
