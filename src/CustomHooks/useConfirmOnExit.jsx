/** why use below custom hook ?
 * “I want one reusable piece of logic that protects users from accidentally closing dialogs or pages when there are unsaved changes.”
 */

import { useEffect } from "react";

export function useConfirmOnExit({
  isDirty, //Boolean indicating if there are unsaved changes
  onClose, //Function to call when it's safe to close
  openConfirmDialog, //Function to open confirmation dialog
}) {
  // 1️⃣ Handle page refresh / tab close
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // 2️⃣ Function to call when user tries to leave
  const requestClose = () => {
    if (!isDirty) {
      onClose(); // safe to close
    } else {
      openConfirmDialog(); // ask confirmation
    }
  };

  return { requestClose };
}
