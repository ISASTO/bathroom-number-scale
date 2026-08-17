import { useEffect, useState } from "react";
import type { BathroomAction } from "../types";
import { loadCustomActions, saveCustomActions } from "../lib/storage";

export function useCustomActions() {
  const [actions, setActions] = useState<BathroomAction[]>(() => loadCustomActions());

  useEffect(() => {
    saveCustomActions(actions);
  }, [actions]);

  const addAction = (action: BathroomAction) => {
    setActions((current) => [...current.filter((item) => item.id !== action.id), action]);
  };

  const deleteAction = (id: string) => {
    setActions((current) => current.filter((action) => action.id !== id));
  };

  return { actions, addAction, deleteAction };
}
