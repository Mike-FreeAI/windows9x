import { useAtomValue, useSetAtom } from "jotai";
import styles from "./Desktop.module.css";
import { ProgramEntry, programsAtom } from "@/state/programs";
import window from "./assets/window.png";
import Image from "next/image";
import { createWindow } from "@/lib/createWindow";
import { useCreateContextMenu } from "@/state/contextMenu";

/**
 * Desktop component renders a list of program icons on desktop.
 * It uses the programs data from the programsAtom atom.
 * @returns {JSX.Element} A div container element that includes a list of ProgramIcon components.
 */
export const Desktop = () => {
  const { programs } = useAtomValue(programsAtom);
  return (
    <div className={styles.desktop}>
      /**
       * This method maps over the 'programs' array, and for each 'program', it returns a 'ProgramIcon' component with a unique key and the program object itself as a prop.
       * @param {Array} programs - An array of program objects.
       * @returns {Array} An array of 'ProgramIcon' components for each program in the 'programs' array.
       */
      {programs.map((program) => (
        <ProgramIcon key={program.name} program={program} />
      ))}
    </div>
  );
};

/**
 * Function component ProgramIcon creates an interactable icon for a program with context menu.
 * It uses the function useCreateContextMenu() to create a context menu for the program icon,
 * and useSetAtom(programsAtom) to manage stateful atom. The context menu provides two actions:
 * to run the program and to remove the program from the list of programs.
 * @param {Object}  program - An object that represents the properties of the program.
 * @returns {ReactElement} Button element for the program icon with interaction functionality.
 */

function ProgramIcon({ program }: { program: ProgramEntry }) {
  const createContextMenu = useCreateContextMenu();
  const dispatch = useSetAtom(programsAtom);
  /**
   * Executes the runProgram method, which initializes a new window for the given program.
   * This method doesn't accept any parameters and doesn't return any value.
   */
  const runProgram = () => {
    createWindow({
      title: program.name,
      program: {
        type: "iframe",
        programID: program.id,
      },
      icon: program.icon ?? undefined,
    });
  };
  return (
    <button
      className={styles.programIcon}
      onContextMenu={createContextMenu([
        { label: "Run", onClick: runProgram },
        {
          label: "Delete",
          /**
           * Handles the click event to dispatch an action for removing a program.
           */
          onClick: () => {
            dispatch({
              type: "REMOVE_PROGRAM",
              payload: program.name,
            });
          },
        },
      ])}
      onDoubleClick={runProgram}
    >
      <Image
        src={program.icon ?? window}
        alt={program.name}
        width={24}
        height={24}
      />
      <div className={styles.programName}>{program.name}</div>
    </button>
  );
}
