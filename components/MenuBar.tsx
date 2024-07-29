import { useCallback, useEffect, useState, useRef } from "react";
import styles from "./MenuBar.module.css";
import cx from "classnames";

type Options = OptionGroup[];

type OptionGroup = {
  label: string;
  items: (Option | null)[];
};

type Option = {
  label: string;
  onClick: () => void;
};

/**
 * The MenuBar function acts as a functional component that handles the rendering of the menu bar with the provided options.
 * @param {{ options: Options }} Object - An object containing the 'options' property. 'options' is an array that represents the different groups of options available in the menu bar. Each element of this array is an object containing properties related to a specific menu option group. 
 * @returns {JSX.Element | null} Returns a JSX element that comprises of the menu bar with different menu options or null if the 'options' array is empty.
 */
export function MenuBar({ options }: { options: Options }) {
  const [openMenuLabel, setOpenMenuLabel] = useState<string | null>(null);
  if (!options.length) return null;

  return (
    <div className={styles.menuBar}>
      /**
       * This function maps through the available options and creates MenuBarButton components for each one.
       * @param {Array} options - an array of option groups to be used in the menu.
       * @param {Object} optionGroup - individual option group from the array.
       * @param {String} openMenuLabel - label for the menu button that opens the menu.
       * @param {Function} setOpenMenuLabel - function used to set the value of openMenuLabel.
       * @returns {Object} a MenuBarButton component for each option group in options array.
       */
      {options.map((optionGroup) => (
        <MenuBarButton
          key={optionGroup.label}
          optionGroup={optionGroup}
          openMenuLabel={openMenuLabel}
          setOpenMenuLabel={setOpenMenuLabel}
        />
      ))}
    </div>
  );
}

/**
 * MenuBarButton function creates a menu bar button with associated dropdowns. It uses hooks to manage states and updates.
 * @param {Object}  optionGroup - An object containing options for the dropdown button.
 * @param {string | null}  openMenuLabel - Determines the menu that is currently being displayed. It's null when no menu is open.
 * @param {Function}  setOpenMenuLabel - Function to set the current active menu. Receives a string or null value as parameter.
 * @returns {JSX.Element} Returns a JSX Element that contains the menu bar button with interactive functionality via onClick events.
 */
function MenuBarButton({
  optionGroup,
  openMenuLabel,
  setOpenMenuLabel,
}: {
  optionGroup: OptionGroup;
  openMenuLabel: string | null;
  setOpenMenuLabel: (label: string | null) => void;
}) {
  /**
   * A function for closing the menu by setting the open menu label as null.
   * This function is defined using the useCallback hook from React, which will return a memorized version of the function.
   * It will only change if one of the dependencies has changed, in this case 'setOpenMenuLabel'.
   * @param {none} There are no parameters for this function.
   * @returns {void} This function does not return any value.
   */
  const closeMenu = useCallback(() => {
    setOpenMenuLabel(null);
  }, [setOpenMenuLabel]);

  const ref = useRef<HTMLDivElement>(null);

  /**
   * Handles the 'useEffect' hook that add 'mousedown' and 'blur' event
   * listeners to the window. These listeners check if a mouse down event
   * occurred outside a particular reference node or if a blur event
   * occurred, and if so, closes the menu. Similarly, it removes the event
   * listeners when the component is unmounting.
   * @param {RefObject} ref - The React ref to the target element.
   * @param {Function} closeMenu - The function to close the menu.
   * @returns {Void} Does not return a value
   */
  useEffect(() => {
    /**
     * Handles the Mouse Down event.
     * @param {MouseEvent}  event - The mouse event.
     */
    const handleMouseDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    /**
     * Handles the onBlur event by closing the menu.
     * Does not take any parameters since it is a callback function for onBlur event.
     * Does not return anything.
     */
    const handleBlur = () => {
      closeMenu();
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("blur", handleBlur);

    /**
     * Anonymous function that removes "mousedown" and "blur" event listeners from the window object.
     * No parameters are expected.
     * @returns {undefined} No return value.
     */
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("blur", handleBlur);
    };
  }, [closeMenu]);

  return (
    <div className={styles.menuBarButtonContainer} ref={ref}>
      <button
        className={cx(styles.menuBarButton, {
          [styles.isOpen]: openMenuLabel === optionGroup.label,
        })}
        /**
         * Handles the click event to set the 'openMenuLabel' state. It checks if the 'openMenuLabel' is equal to 'optionGroup.label', 
         * if true, it sets the 'openMenuLabel' state to null, otherwise, it sets 'optionGroup.label'.
         */
        onClick={() =>
          setOpenMenuLabel(
            openMenuLabel === optionGroup.label ? null : optionGroup.label
          )
        }
      >
        {optionGroup.label}
      </button>
      {openMenuLabel === optionGroup.label && (
        <MenuBarDropdown optionGroup={optionGroup} closeMenu={closeMenu} />
      )}
    </div>
  );
}

/**
 * A function component that generates a dropdown menu from an option group
 * @param {Object} optionGroup - Object containing option group data for the dropdown
 * @param {Function} closeMenu - Function to execute closing of the menu
 * @returns {JSX.Element} Returns a div containing the dropdown menu populated with options from the provided group
 */
function MenuBarDropdown({
  optionGroup,
  closeMenu,
}: {
  optionGroup: OptionGroup;
  closeMenu: () => void;
}) {
  return (
    <div className={cx(styles.menuBarDropdown, "window")}>
      {optionGroup.items.map(
        /**
         * This anonymous function generates a Button element, given an item with 'label' and 'onClick' properties.
         * The generated Button has an onClick event which triggers the item's own onClick event, followed by the closeMenu function.
         * @param {Object} item - The object containing the 'label' and 'onClick' properties. If this parameter is null or undefined, the function returns null.
         * @returns {JSX.Element} A Button element with assigned key, onClick function, and label, or null if the item parameter is null or undefined.
         */
        (item) =>
          item && (
            <button
              key={item.label}
              /**
               * Executes the 'onClick' method nested in 'item' object and the 'closeMenu' function when clicked.
               */
              onClick={() => {
                item.onClick();
                closeMenu();
              }}
            >
              {item.label}
            </button>
          )
      )}
    </div>
  );
}
