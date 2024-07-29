"use client";
import { getDefaultStore, useAtom, useAtomValue, useSetAtom } from "jotai";
import { getIframeID, windowAtomFamily } from "@/state/window";
import { useEffect, useRef } from "react";
import { programAtomFamily, programsAtom } from "@/state/programs";
import assert from "assert";
import { registryAtom } from "@/state/registry";
import { getURLForProgram } from "@/lib/getURLForProgram";

/**
 * A functional React component that renders an Iframe.
 * This component is responsible for handling the Iframe operations such as fetch icon, handle messages,
 * It maintains some stateful informations such as whether the program is an iframe,
 * and adding event listeners for 'message' to handle the operations sent as messages.
 * @param {{id: string}} id - The unique identifier for the Iframe. 
 * @returns {JSX.Element} Returns an Iframe element that has operations and listeners bound to it.
 */
export function Iframe({ id }: { id: string }) {
  const [state, dispatch] = useAtom(windowAtomFamily(id));
  const ref = useRef<HTMLIFrameElement>(null);
  const dispatchPrograms = useSetAtom(programsAtom);
  const startedRef = useRef(false);
  const registry = useAtomValue(registryAtom);

  assert(state.program.type === "iframe", "Program is not an iframe");

  const program = useAtomValue(programAtomFamily(state.program.programID));

  const { icon } = state;

  const programID = state.program.programID;

  assert(program, "Program not found");

  const url = getURLForProgram(program, registry);

  /**
   * Hook to fetch an icon using title from the state. If the icon does not exist, it fetches from the specific URL.
   * Dispatches the fetched icon to update the state. It also dispatches to update the associated program.
   * Prevents fetching when request has already started and does not re-trigger if the icon exists.
   * 
   * @param {Object}  state - Contains the title of the icon. 
   * @param {function}  dispatch - Function to update the global state.
   * @param {function}  dispatchPrograms - Function to update specific programs state.
   * @param {string}  icon - The existing icon that was previously fetched.
   * @param {string|number}  programID - ID of the program for which the icon is needed.
   *
   * @returns {void} Does not return any value.
   */
  useEffect(() => {
    /**
     * Asynchronous function to fetch icons related to a program title from a given API endpoint and dispatch necessary actions.
     * This function makes POST request to '/api/icon' with program title as query parameter and also in the request body.
     * After the successful API call, it dispatches Redux actions to store the fetched icon and updates program details.
     */
    async function fetchIcon() {
      if (startedRef.current) {
        return;
      }
      startedRef.current = true;
      const res = await fetch(`/api/icon?name=${state.title}`, {
        method: "POST",
        body: JSON.stringify({ name: state.title }),
      });

      if (!res.ok) {
        return;
      }
      const dataUri = await res.text();
      dispatch({ type: "SET_ICON", payload: dataUri });
      dispatchPrograms({
        type: "UPDATE_PROGRAM",
        payload: {
          id: programID,
          name: state.title,
          icon: dataUri,
        },
      });
      startedRef.current = false;
    }
    if (!icon) {
      fetchIcon();
    }
  }, [state.title, dispatch, dispatchPrograms, icon, programID]);

  // Adding message event listener to the iframe to handle registry operations
  useEffect(() => {
    /**
     * Handles messages received from an iframe. 
     * This function is design to interpret the message which contains operation type and key-value data,
     * and based on the operation type it performs different actions.
     *
     * @param {MessageEvent}  event - The event object, received from iframe. It expects the message to include operation, key, value, id, and returnJson.
     *
     * This function doesn't explicitly return, but as side-effects it can
     * post messages back to the event source or update the program's status.
     */
    
    const handleMessage = async (event: MessageEvent) => {
      // Check if the message is from our iframe
      if (event.source !== ref.current?.contentWindow) {
        return;
      }

      // Assuming the message contains the operation type and key-value data
      const { operation, key, value, id, returnJson } = event.data;

      const store = getDefaultStore();
      const registry = store.get(registryAtom);

      switch (operation) {
        case "get": {
          event.source!.postMessage({
            operation: "result",
            id,
            value: registry[key],
          });
          break;
        }
        case "set": {
          store.set(registryAtom, { ...registry, [key]: value });
          break;
        }
        case "delete": {
          store.set(registryAtom, { ...registry, [key]: undefined });
          break;
        }
        case "listKeys": {
          event.source!.postMessage({
            operation: "result",
            id,
            value: Object.keys(registry),
          });
          break;
        }
        case "chat": {
          const result = await fetch(`/api/chat`, {
            method: "POST",
            body: JSON.stringify({ messages: value, returnJson }),
          });
          event.source!.postMessage({
            operation: "result",
            value: await result.json(),
            id,
          });
          break;
        }
        case "registerOnSave": {
          dispatch({
            type: "UPDATE_PROGRAM",
            payload: { type: "iframe", canSave: true },
          });
          break;
        }
        case "registerOnOpen": {
          dispatch({
            type: "UPDATE_PROGRAM",
            payload: { type: "iframe", canOpen: true },
          });
          break;
        }
        case "saveComplete": {
          // Handled in Window.tsx
          break;
        }

        default:
          console.error("Unsupported operation");
      }
    };

    window.addEventListener("message", handleMessage);
    /**
     * A function that removes an event listener from the message event.
     * @returns {Function} A function that when called, will remove the 'handleMessage' event handler from the 'message' event on the window object.
     */
    return () => window.removeEventListener("message", handleMessage);
  }, [dispatch, ref]);

  return (
    <iframe
      ref={ref}
      id={getIframeID(id)}
      sandbox={!program?.code ? "allow-same-origin" : undefined}
      src={!program?.code ? url : undefined}
      srcDoc={program?.code || undefined}
      style={{ width: "100%", flexGrow: 1, border: "none" }}
      allowTransparency
      /**
       * onLoad function handles the loading events. It checks if the program is an iframe, then sets the loading state to 'false'. 
       * If the program code is not present, it gets the outer HTML from the iframe content and dispatches an action to update the program code.
       * 
       * @param {object} state - state object containing program data.
       * @param {function} dispatch - function to dispatch actions to the state.
       * @param {object} program - program data (optional).
       * @param {object} ref - React ref pointing to the program iframe.
       * @param {string} programID - ID of the program being loaded.
       * @param {function} dispatchPrograms - function to dispatch actions to the programs state.
       */
      
      onLoad={() => {
        assert(state.program.type === "iframe", "Program is not an iframe");

        if (program?.code) {
          return;
        }

        dispatch({ type: "SET_LOADING", payload: false });
        if (ref.current) {
          const outerHTML =
            ref.current.contentDocument?.documentElement.outerHTML;
          assert(outerHTML, "Outer HTML of iframe content is undefined");
          assert(state.program.type === "iframe", "Program is not an iframe");
          dispatchPrograms({
            type: "UPDATE_PROGRAM",
            payload: {
              id: programID,
              code: outerHTML,
            },
          });
        }
      }}
    />
  );
}
