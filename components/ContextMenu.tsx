import { contextMenuAtom } from "@/state/contextMenu";
import { useAtom } from "jotai";
import { useEffect } from "react";
import styles from "./ContextMenu.module.css";

/**
 * An exported function that returns a contextual menu. On mounting, it attaches a click event listener to the window which sets the context menu to null. The listener is removed on unmounting. If no context menu is set, the function returns null. If a context menu is set, it returns a div containing the menu items with styles applied.
 * @returns {JSX.Element| null} Returns a div element showcasing menu items if there's data passed via `useAtom()`, otherwise, it returns null.
 */
export function ContextMenu() {
  const [contextMenu, setContextMenu] = useAtom(contextMenuAtom);

  /**
   * Registers a click event listener to the window that sets a context menu to null.
   * This listener is cleaned up on component unmount to avoid memory leaks.
   * @param {function}  setContextMenu -  State setter function for contextMenu.
   * @returns {void} This method does not have a return value.
   */
  
  useEffect(() => {
    /**
     * Handles a click event by setting the context menu to null.
     * No parameters and no return.
     */
    const handleClick = () => {
      setContextMenu(null);
    };

    window.addEventListener("click", handleClick);

    /**
     * Function that removes the 'click' event listener from the window object.
     * This is usually used as a cleanup function in effect hooks.
     * @returns {function} Function that when called, unbinds the 'click' listener from the window object.
     */
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [setContextMenu]);

  if (!contextMenu) return null;

  const { x, y, items } = contextMenu;

  return (
    <div
      className="window"
      style={{
        position: "absolute",
        top: y,
        left: x,
        zIndex: 1000,
      }}
    >
      <div className={styles.contextMenu}>
        /**
         * Maps through the items array and returns a button element for each item.
         * The index of the item in the array is used as the key for the button element.
         * The onClick property of the item is used as the onClick event of the button.
         * The label property of the item is displayed on the button.
         * @param {Array}  items - Array of Object. Each object contains an `onClick` function and a `label` string.
         * @returns {ReactElement} An array of button elements.
         */
        {items.map((item, index) => (
          <button key={index} className="menu-item" onClick={item.onClick}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
