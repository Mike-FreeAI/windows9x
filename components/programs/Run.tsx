"use client";
import { useSetAtom } from "jotai";
import { windowsListAtom } from "@/state/windowsList";
import { createWindow } from "../../lib/createWindow";
import { ProgramEntry, programsAtom } from "@/state/programs";
import { useState } from "react";

/**
 * The Run function is a component that renders a form allowing the user to input a description 
 * of a program they want to run. It employs the use of state atoms (windowsListAtom and programsAtom) 
 * and the useState hook to maintain its states. The function handles the form submission event where 
 * it prevents the default behavior, checks the loading state, and sets it to true. It then gets the form data 
 * and evaluates the description of the program based on the string length, and fetches data from an API 
 * if the length is larger than 20. A new program is then added to the programsAtom state and then a new window 
 * is created with the new program. Lastly, the current window is removed from the windowsListAtom state.
 * @param {{id: string}} props - The function's properties, which consist of the id prop, a string that uniquely identifies a ProgramEntry.
 * @returns {JSX.Element} Returns a form component constructed with JSX.
 */

export function Run({ id }: { id: string }) {
  const windowsDispatch = useSetAtom(windowsListAtom);
  const programsDispatch = useSetAtom(programsAtom);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <form
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
      /**
       * Handles the submit event by performing validations, fetching names from API based on certain conditions, and initializing 
       * window for the program. Also adds the new program to the programs counter and removes the currnet window from the windows counter.
       * @param {Event} e - The event object, which is typically associated with a user action, like a mouse click.
       * @returns {void} This function doesn't return anything; it primarily performs side effects by modifying the window & programs states.
       */
      onSubmit={async (e) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const programDescription = formData.get("program-description");
        if (typeof programDescription === "string") {
          let name = programDescription;

          if (name.length > 20) {
            const nameResp = await fetch("/api/name", {
              method: "POST",
              body: JSON.stringify({ desc: programDescription }),
            });

            name = (await nameResp.json()).name;
          }

          const program: ProgramEntry = {
            id: name,
            prompt: programDescription,
            name,
          };

          programsDispatch({ type: "ADD_PROGRAM", payload: program });

          createWindow({
            title: name,
            program: {
              type: "iframe",
              programID: program.id,
            },
            loading: true,
            size: {
              width: 400,
              height: 400,
            },
          });
          windowsDispatch({ type: "REMOVE", payload: id });
        }
      }}
    >
      <p>
        Type the description of the program you want to run and Windows will
        create it for you.
      </p>
      <div className="field-row">
        <label htmlFor="program-description">Open: </label>
        <input
          id="program-description"
          name="program-description"
          type="text"
          style={{ width: "100%" }}
          spellCheck={false}
          autoComplete="off"
          autoFocus
        />
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button type="submit" disabled={isLoading}>
          Open
        </button>
        <button
          /**
           * Handles click event to dispatch an action for removing a window object.
           * @param {undefined} No parameter
           * @returns {undefined} No direct return value. Dispatches an action to the "windows" reducer with a "REMOVE" type and payload consisting of the window's "id".
           */
          onClick={() => windowsDispatch({ type: "REMOVE", payload: id })}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
