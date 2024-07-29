import { atom, useSetAtom } from "jotai";

export const contextMenuAtom = atom<{
  x: number;
  y: number;
  items: { label: string; onClick: () => void }[];
} | null>(null);

/**
 * Function hook that creates and sets a context (right click) menu using the specified items. 
 * The position of the context menu is determined by the MouseEvent's clientX and clientY properties.
 *
 * @param {Array<Object>}  items - Array of objects representing the context menu items. 
 * Every object must contain 'label' string to represent the item label 
 * and 'onClick' function for handling click events on the item.
 *
 * @returns {Function} A function that takes a MouseEvent as argument and sets the context menu at the mouse's position
 */
export function useCreateContextMenu() {
  const setContextMenu = useSetAtom(contextMenuAtom);

  /**
   * Event handling method that sets the context menu with given items at the position of mouse click.
   * @param {Array<{label: string, onClick: function}>} items - An array of objects each having a label and an onClick method.
   * @returns {Function} - A function that uses the React.MouseEvent to prevent default behavior and stop propagation.
   */
  return (items: { label: string; onClick: () => void }[]) =>
    /**
     * Handles a right-click event, prevents its default action and propagation, and sets the context menu position and items.
     * @param {React.MouseEvent}  e - The mouse event triggered by React.
     */
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, items });
    };
}
