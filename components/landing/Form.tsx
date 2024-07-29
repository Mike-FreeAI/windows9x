"use client";
import { useFormState } from "react-dom";

export type SignUpState =
  | { type: "error"; error: string }
  | { type: "success" }
  | { type: "initial" };

const initialState: SignUpState = { type: "initial" };

/**
 * A Form component that manages form state and submission using the provided `action`.
 * It provides input for email and displays success or error messages based on the form submission state.
 * The form state is initialized with `initialState` and any state update is handed off to the `action`.
 *
 * @param {{ action: (prevState: SignUpState, formData: FormData) => Promise<SignUpState>; }} - The effect function to run when form is submitted, which returns a Promise that resolves to the new sign up state.
 * 
 * @returns {React.Component} A Form component that manages form state and handles form submission.
 */
export function Form({
  action,
}: {
  action: (prevState: SignUpState, formData: FormData) => Promise<SignUpState>;
}) {
  const [state, formAction] = useFormState(action, initialState);
  return (
    <form action={formAction}>
      <div className="field-row">
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" />
      </div>
      <button type="submit">Sign Up</button>
      {state.type === "error" && <p style={{ color: "red" }}>{state.error}</p>}
      {state.type === "success" && (
        <p style={{ color: "green" }}>
          We&apos;ll let you know when we launch!
        </p>
      )}
    </form>
  );
}
