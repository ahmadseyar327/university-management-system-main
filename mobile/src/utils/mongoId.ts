import type { UserRecord } from "../contexts/AuthContext";

export function mongoId(doc: UserRecord | Record<string, unknown> | null | undefined): string {
  if (!doc) return "";
  const id = doc._id;
  if (typeof id === "string") return id;
  if (id && typeof id === "object" && "$oid" in (id as Record<string, unknown>)) {
    return String((id as { $oid: string }).$oid);
  }
  return String(id ?? "");
}
