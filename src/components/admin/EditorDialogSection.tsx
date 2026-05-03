import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
};

/** قسم داخل نافذة تحرير إدارية — عنوان واضح وحدود خفيفة */
export function EditorDialogSection({ title, children, className }: Props) {
  return (
    <section
      className={cn(
        "space-y-3 rounded-xl border border-border/50 bg-muted/10 p-4 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.04)]",
        className,
      )}
    >
      <h3 className="border-b border-border/50 pb-2 font-display text-[11px] font-semibold tracking-wide text-primary">
        {title}
      </h3>
      <div className="space-y-3 text-right">{children}</div>
    </section>
  );
}

export const editorDialogInputClass =
  "h-10 rounded-lg border-border/70 bg-background/80 text-right shadow-sm transition-colors focus-visible:border-primary/45 focus-visible:ring-primary/20";

export const editorDialogTextareaClass =
  "min-h-[88px] rounded-lg border-border/70 bg-background/80 text-right shadow-sm transition-colors focus-visible:border-primary/45 focus-visible:ring-primary/20";

export const editorDialogMonoClass =
  "h-10 rounded-lg border-border/70 bg-background/80 font-mono text-sm shadow-sm transition-colors focus-visible:border-primary/45 focus-visible:ring-primary/20";
