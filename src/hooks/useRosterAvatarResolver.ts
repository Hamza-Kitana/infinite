import { useEffect, useMemo, useState } from "react";
import { IC_PUBLIC_USERS_CHANGED_EVENT } from "@/contexts/PublicUserContext";
import { listenStorageSync } from "@/lib/storageSync";
import { loadPublicUserAvatars, resolveRosterPersonImage } from "@/lib/rosterAvatar";

const PUBLIC_USERS_KEY = "ic_public_users_v1";

export function useRosterAvatarResolver() {
  const [users, setUsers] = useState(() => loadPublicUserAvatars());

  useEffect(() => {
    return listenStorageSync(PUBLIC_USERS_KEY, () => setUsers(loadPublicUserAvatars()), [
      IC_PUBLIC_USERS_CHANGED_EVENT,
    ]);
  }, []);

  return useMemo(
    () => (person: { image?: string; userId?: string; discordId?: string }) =>
      resolveRosterPersonImage(users, person, 256),
    [users],
  );
}
