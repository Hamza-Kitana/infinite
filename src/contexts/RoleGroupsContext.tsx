import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addRoleGroup,
  loadRoleGroups,
  removeRoleGroup,
  ROLE_GROUPS_EVENT,
  updateRoleGroup,
  type StaffRoleGroup,
} from "@/staff/roleGroups";
import type { ManagedStaffRole } from "@/staff/staffDirectory";

type RoleGroupsContextValue = {
  groups: StaffRoleGroup[];
  refresh: () => void;
  createGroup: (input: {
    name: string;
    description?: string;
    roles: ManagedStaffRole[];
  }) => StaffRoleGroup;
  editGroup: (
    id: string,
    patch: Partial<Pick<StaffRoleGroup, "name" | "description" | "roles">>,
  ) => void;
  deleteGroup: (id: string) => void;
};

const RoleGroupsContext = createContext<RoleGroupsContextValue | null>(null);

export function RoleGroupsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<StaffRoleGroup[]>(() => loadRoleGroups());

  const refresh = useCallback(() => {
    setGroups(loadRoleGroups());
  }, []);

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener(ROLE_GROUPS_EVENT, onChange as EventListener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ic_staff_role_groups_v1") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(ROLE_GROUPS_EVENT, onChange as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  const createGroup = useCallback<RoleGroupsContextValue["createGroup"]>((input) => {
    const created = addRoleGroup(input);
    setGroups(loadRoleGroups());
    return created;
  }, []);

  const editGroup = useCallback<RoleGroupsContextValue["editGroup"]>((id, patch) => {
    updateRoleGroup(id, patch);
    setGroups(loadRoleGroups());
  }, []);

  const deleteGroup = useCallback<RoleGroupsContextValue["deleteGroup"]>((id) => {
    removeRoleGroup(id);
    setGroups(loadRoleGroups());
  }, []);

  const value = useMemo<RoleGroupsContextValue>(
    () => ({ groups, refresh, createGroup, editGroup, deleteGroup }),
    [groups, refresh, createGroup, editGroup, deleteGroup],
  );

  return <RoleGroupsContext.Provider value={value}>{children}</RoleGroupsContext.Provider>;
}

export function useRoleGroups(): RoleGroupsContextValue {
  const ctx = useContext(RoleGroupsContext);
  if (!ctx) throw new Error("useRoleGroups يجب أن يُستخدم داخل RoleGroupsProvider");
  return ctx;
}
