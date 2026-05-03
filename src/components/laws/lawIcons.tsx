import * as Lucide from "lucide-react";
import type { ComponentType } from "react";

type IconProps = { className?: string };

export function LawIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Lucide as Record<string, ComponentType<IconProps>>)[name] ?? Lucide.Scale;
  return <Cmp className={className} />;
}

/** أسماء الأيقونات المتاحة لمحرر القوانين */
export const LAW_ICON_OPTIONS = [
  "Scale",
  "Shield",
  "Building2",
  "MessageSquareWarning",
  "Gavel",
  "Store",
  "BookOpen",
  "FileText",
  "AlertTriangle",
  "Ban",
] as const;
