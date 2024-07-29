import { OS } from "@/components/OS";
import { Landing } from "@/components/landing/Landing";
import isLive from "@/lib/isLive";

/**
 * Function to choose between rendering the OS component or the Landing component based on the 'isLive' status.
 * @returns {JSX.Element} Either the OS or Landing component, depending on the 'isLive' state.
 */
export default function Home() {
  return isLive ? <OS /> : <Landing />;
}
