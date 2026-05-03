"use client";

import { ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui";

type Props = {
  resultText: string;
  setResultText: (v: string) => void;
  onCopy: () => void;
  copyLabel: string;
  showAlertPreview?: boolean;
};

export function AgentResultPanel({ resultText, setResultText, onCopy, copyLabel, showAlertPreview, children }: Props & { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-[280px] flex-col gap-3 rounded-2xl border border-secondary/15 bg-cream/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-primary">Resultado (editable)</span>
        <Button type="button" variant="secondary" className="shrink-0 py-1.5 text-xs" onClick={onCopy} disabled={!resultText}>
          <ClipboardCopy className="mr-1 h-4 w-4" />
          {copyLabel}
        </Button>
      </div>
      <textarea
        className="min-h-[220px] flex-1 resize-y rounded-xl border border-secondary/15 bg-white p-3 font-mono text-xs leading-relaxed text-foreground shadow-inner"
        value={resultText}
        onChange={(e) => setResultText(e.target.value)}
        placeholder="El resultado aparecerá aquí. Puede editarlo antes de copiar."
      />
      {showAlertPreview && children}
    </div>
  );
}
