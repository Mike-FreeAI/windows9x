"use client";

import { useState } from "react";

/**
 * A function component that counts down to a specific date (July 5, 2024)
 * This component calculates the time left from the current date to the specific date and updates a state variable timeLeft with the resulting number of days.
 * It then returns a div displaying the number of days left.
 *
 * Note: No input parameters are needed for this function as the function is self-contained and does not depend on external variables.
 * @returns {JSX.Element} A div element that displays the number of days left until July 5, 2024.
 */
export default function CountDown() {
  /**
   * Calculates the remaining time from today until July 5th, 2024.
   * No parameters are taken by this method.
   * @returns {Object} An object contains the remaining time in days. If the date passed, it will return 0.
   */
  const calculateTimeLeft = () => {
    const difference = +new Date(`2024-07-05`) - +new Date();
    let timeLeft = {
      days: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      };
    }

    return timeLeft;
  };

  /**
   * Initializes state variable timeLeft using useState. 
   * Its initial value is obtained by calling the calculateTimeLeft function.
   */
  const [timeLeft] = useState(() => calculateTimeLeft());

  return <div>{timeLeft.days} days</div>;
}
