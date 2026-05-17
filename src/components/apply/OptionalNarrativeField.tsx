import { CheckCircle2, PenLine, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  fieldLabel: string;
  value: string;
  onChange: (value: string) => void;
  noneSelected: boolean;
  onNoneSelectedChange: (selected: boolean) => void;
  fillOptionLabel: string;
  noneOptionLabel: string;
  noneTitle: string;
  noneDescription: string;
  placeholder: string;
  rows?: number;
};

export function OptionalNarrativeField({
  id,
  fieldLabel,
  value,
  onChange,
  noneSelected,
  onNoneSelectedChange,
  fillOptionLabel,
  noneOptionLabel,
  noneTitle,
  noneDescription,
  placeholder,
  rows = 5,
}: Props) {
  const selectFill = () => {
    onNoneSelectedChange(false);
  };

  const selectNone = () => {
    onNoneSelectedChange(true);
    onChange("");
  };

  return (
    <div className="space-y-4">
      <Label htmlFor={noneSelected ? undefined : id} className="font-display text-xs text-primary">
        {fieldLabel}
      </Label>

      <div
        className="grid grid-cols-2 gap-2 rounded-2xl border border-primary/25 bg-background/40 p-1.5"
        role="group"
        aria-label={fieldLabel}
      >
        <button
          type="button"
          onClick={selectFill}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-center font-display text-xs font-semibold transition-all sm:text-sm",
            !noneSelected
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
              : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
          )}
        >
          <PenLine className="h-4 w-4 shrink-0" aria-hidden />
          {fillOptionLabel}
        </button>
        <button
          type="button"
          onClick={selectNone}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-center font-display text-xs font-semibold transition-all sm:text-sm",
            noneSelected
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
              : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
          )}
        >
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
          {noneOptionLabel}
        </button>
      </div>

      {noneSelected ? (
        <div
          className="rounded-2xl border border-emerald-500/35 bg-gradient-to-l from-emerald-500/10 via-background/60 to-background/40 p-4 text-right shadow-sm"
          role="status"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-display text-sm font-semibold text-foreground">{noneTitle}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{noneDescription}</p>
              <button
                type="button"
                onClick={selectFill}
                className="mt-2 text-xs font-medium text-primary underline-offset-2 hover:underline"
              >
                تغيير — أريد الكتابة بدلاً من ذلك
              </button>
            </div>
          </div>
        </div>
      ) : (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={cn(
            "w-full resize-none rounded-xl border border-primary/30 bg-input px-3 py-3 text-sm text-foreground",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40",
          )}
          dir="rtl"
        />
      )}
    </div>
  );
}
