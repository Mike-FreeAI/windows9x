"use client";
import { useAtom } from "jotai";
import { windowAtomFamily } from "@/state/window";
import { useEffect, useRef, useState } from "react";

/**
 * A function component to handle a paint canvas operation.
 * This function provides features such as drawing, clearing canvas, manipulating colors, and line thickness.
 * @param {{ id: string }}  { id } - an object that contains an id of type string to identify the Paint component
 * @returns {ReactNode} A grouped React Element containing canvas controls and the canvas itself for drawing
 */
export function Paint({ id }: { id: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2); // Added state for stroke width
  const [windowState] = useAtom(windowAtomFamily(id));
  const bodySize = windowState.size;

  /**
   * Sets-up the drawing context of a canvas; specifies how the end of the line looks, specifies the shape used to join two line segments and adjusts the width of the stroke as per input. The provided stroke width is respective to state change.
   * @param {Number} strokeWidth - Width of the stroke for the line to be drawn on the canvas
   * @returns {undefined} Does not return anything. React's useEffect hook is intended to cause side effects to the state of the component.
   */
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = strokeWidth; // Use state for stroke width
  }, [strokeWidth]); // Added strokeWidth dependency

  /**
   * Applies a fill effect on a canvas element using a white color.
   * This effect is applied whenever the component mounts or updates.
   * @param {object} canvasRef - A reference to the canvas element.
   * @returns {undefined} Does not return anything.
   */
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  /**
   * This method initiates the process of drawing on a HTML canvas element when a specified mouse event occurs.
   * @param {React.MouseEvent<HTMLCanvasElement, MouseEvent>} e - The mouse event of the HTML canvas element.
   * @returns {void} It doesn't return anything.
   */
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  /**
   * Handle mouse event on an HTML canvas element that draws a line from the last point to the current point,
   * using the specified color, when isDrawing is true.
   * @param {React.MouseEvent<HTMLCanvasElement, MouseEvent>}  e - Represents mouse event on HTML canvas.
   */
  const draw = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  /**
   * This method stops the drawing process by setting the 'isDrawing' state to false.
   * It does not take any parameters and does not return any value.
   */
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  /**
   * Clears the canvas and resets the background to white. 
   * No parameters have been passed to this function and hence @param is not needed.
   * @returns {void} Does not return anything.
   */
  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <>
      <div className="field-row" style={{ justifyContent: "flex-end" }}>
        <button onClick={clearCanvas}>Clear</button>
        <button
        // onClick={() => {
        //   createWindow({
        //     title: "new program.exe",
        //     program: {
        //       type: "iframe",
        //       src: `/api/image?image=${encodeURIComponent(getJpegBase64())}`,
        //     },
        //     size: {
        //       width: 800,
        //       height: 600,
        //     },
        //     loading: true,
        //   });
        // }}
        >
          Make Real
        </button>
      </div>
      <div className="field-row" style={{ marginBottom: 8 }}>
        <label htmlFor="color">Color:</label>
        <input
          type="color"
          id="color"
          value={color}
          /**
           * Processes the change in color
           * @param {object} e - The event object
           * @returns {void} No return
           */
          onChange={(e) => setColor(e.target.value)}
        />
        <label htmlFor="stroke-width">Stroke:</label>{" "}
        {/* Added label for stroke width */}
        <input
          type="range" // Added range input for stroke width
          id="stroke-width"
          min="1"
          max="10"
          value={strokeWidth}
          /**
           * Handles the change event and updates the stroke width state with the new value.
           * @param {Object} e - The event object which contains information about the input change.
           */
          onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
        />
      </div>
      <canvas
        ref={canvasRef}
        style={{ backgroundColor: "white" }}
        width={bodySize.width}
        height={bodySize.height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />
    </>
  );
}
