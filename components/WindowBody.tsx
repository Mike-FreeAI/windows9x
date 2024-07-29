"use client";

import { assertNever } from "@/lib/assertNever";
import { WindowState } from "@/state/window";
import { Paint } from "./programs/Paint";
import { Iframe } from "./programs/Iframe";
import { Welcome } from "./programs/Welcome";
import { Run } from "./programs/Run";
import { Help } from "./programs/Help";
import { Explorer } from "./programs/Explorer";

/**
 * Renders a component based on the state's program type.
 * @param {{ state: WindowState }} Object that contains WindowState - Describes the state of the window, which determines the type of component to render.
 * @returns {JSX.Element} A JSX element according to the program type in the state.
 */
export function WindowBody({ state }: { state: WindowState }) {
  switch (state.program.type) {
    case "welcome":
      return <Welcome id={state.id} />;
    case "run":
      return <Run id={state.id} />;
    case "iframe":
      return <Iframe id={state.id} />;
    case "paint":
      return <Paint id={state.id} />;
    case "help":
      return <Help id={state.id} />;
    case "explorer":
      return <Explorer id={state.id} />;
    default:
      assertNever(state.program);
  }
}
