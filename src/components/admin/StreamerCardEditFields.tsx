import { useCallback, useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StreamerCardDraft } from "@/lib/streamerApplication";
import { STREAMER_PLACEHOLDER_IMAGE } from "@/lib/streamerApplication";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

type StreamerCardEditFieldsProps = {
  value: StreamerCardDraft;
  onChange: (next: StreamerCardDraft) => void;
  inputClassName?: string;
  textareaClassName?: string;
  compact?: boolean;
};

export function StreamerCardEditFields({
  value,
  onChange,
  inputClassName,
  textareaClassName,
  compact = false,
}: StreamerCardEditFieldsProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const patch = useCallback(
    (partial: Partial<StreamerCardDraft>) => {
      onChange({ ...value, ...partial });
    },
    [onChange, value],
  );

  const onPickFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("\u0627\u062e\u062a\u0631 \u0645\u0644\u0641 \u0635\u0648\u0631\u0629 \u0641\u0642\u0637");
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error("\u062d\u062c\u0645 \u0627\u0644\u0635\u0648\u0631\u0629 \u0643\u0628\u064a\u0631 \u2014 \u0627\u0644\u062d\u062f \u0627\u0644\u0623\u0642\u0635\u0649 2 \u0645\u064a\u062c\u0627\u0628\u0627\u064a\u062a");
        return;
      }
      try {
        patch({ image: await readFileAsDataUrl(file) });
        toast.success("\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0635\u0648\u0631\u0629");
      } catch {
        toast.error("\u062a\u0639\u0630\u0631 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0635\u0648\u0631\u0629");
      }
    },
    [patch],
  );

  const hasCustomImage =
    value.image.trim().length > 0 && value.image !== STREAMER_PLACEHOLDER_IMAGE;

  return (
    <div className="space-y-4">
      <div className={cn("space-y-1.5", compact && "space-y-1")}>
        <Label className="text-xs">{"\u0627\u0644\u0627\u0633\u0645 \u0639\u0644\u0649 \u0627\u0644\u0628\u0637\u0627\u0642\u0629"}</Label>
        <Input
          value={value.name}
          onChange={(e) => patch({ name: e.target.value })}
          className={inputClassName}
          placeholder={"\u0627\u0633\u0645 \u0627\u0644\u0639\u0631\u0636"}
        />
      </div>
      <div className={cn("space-y-1.5", compact && "space-y-1")}>
        <Label className="text-xs">{"\u0627\u0644\u0645\u0633\u0645\u0649 (\u0627\u0644\u062f\u0648\u0631)"}</Label>
        <Input
          value={value.role}
          onChange={(e) => patch({ role: e.target.value })}
          className={inputClassName}
          placeholder={"\u0635\u0627\u0646\u0639 \u0645\u062d\u062a\u0648\u0649 \u0645\u0639\u062a\u0645\u062f"}
        />
      </div>
      <div className={cn("space-y-1.5", compact && "space-y-1")}>
        <Label className="text-xs">{"\u0627\u0644\u0646\u0628\u0630\u0629"}</Label>
        <Textarea
          value={value.bio}
          onChange={(e) => patch({ bio: e.target.value })}
          className={cn("min-h-[88px]", textareaClassName)}
          placeholder={"\u0646\u0628\u0630\u0629 \u0639\u0646 \u0627\u0644\u0642\u0646\u0627\u0629 \u0648\u0627\u0644\u0628\u062b\u2026"}
        />
      </div>
      <div className={cn("space-y-1.5", compact && "space-y-1")}>
        <Label className="text-xs">{"\u0631\u0627\u0628\u0637 \u0627\u0644\u0628\u062b"}</Label>
        <Input
          value={value.streamUrl}
          onChange={(e) => patch({ streamUrl: e.target.value })}
          className={inputClassName}
          dir="ltr"
          placeholder="https://kick.com/?"
        />
      </div>
      <div className={cn("space-y-2", compact && "space-y-1.5")}>
        <Label className="text-xs">{"\u0635\u0648\u0631\u0629 \u0627\u0644\u0628\u0637\u0627\u0642\u0629"}</Label>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              void onPickFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <ImagePlus className="ms-1 h-4 w-4" />
            {"\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0635\u0648\u0631\u0629"}
          </Button>
          {hasCustomImage ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
              onClick={() => {
                patch({ image: STREAMER_PLACEHOLDER_IMAGE });
                toast.message(
                  "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0635\u0648\u0631\u0629 \u2014 \u0633\u062a\u064f\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0629 \u062d\u062a\u0649 \u062a\u0631\u0641\u0639 \u0623\u062e\u0631\u0649",
                );
              }}
            >
              <Trash2 className="ms-1 h-4 w-4" />
              {"\u062d\u0630\u0641 \u0627\u0644\u0635\u0648\u0631\u0629"}
            </Button>
          ) : null}
        </div>
        <div className="flex justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/80 p-3 dark:border-slate-600 dark:bg-slate-800/50">
          <img
            src={value.image || STREAMER_PLACEHOLDER_IMAGE}
            alt=""
            className="max-h-36 max-w-full rounded-lg border border-slate-200 object-contain"
          />
        </div>
      </div>
    </div>
  );
}
