import { useEffect, useMemo } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { createClientSecretFetcher, workflowId } from "../lib/chatkitSession";

const REPLACEMENTS: Array<[string, string]> = [
  ["What can I help with today?", "Waarmee kan ik je vandaag helpen?"],
  ["Message the AI", "Stel je vraag aan Skillport…"],
];

function applyDutchEverywhere(root: Document | ShadowRoot) {
  // 1) Replace visible text nodes
  const walker = document.createTreeWalker(root as any, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const v = (node.nodeValue || "").trim();
    for (const [from, to] of REPLACEMENTS) {
      if (v === from) node.nodeValue = to;
    }
  }

  // 2) Replace placeholders / aria-labels
  const els =
    (root as any).querySelectorAll?.(
      "input, textarea, button, [aria-label], [placeholder]"
    ) || [];
  els.forEach((el: any) => {
    const ph = el.getAttribute?.("placeholder");
    const al = el.getAttribute?.("aria-label");

    if (ph === "Message the AI")
      el.setAttribute("placeholder", "Stel je vraag aan Skillport…");
    if (al === "Message the AI")
      el.setAttribute("aria-label", "Stel je vraag aan Skillport…");
  });
}

function scanAndPatch() {
  // Patch document
  applyDutchEverywhere(document);

  // Patch every shadow root we can find
  const all = Array.from(document.querySelectorAll("*")) as any[];
  for (const el of all) {
    if (el.shadowRoot) {
      applyDutchEverywhere(el.shadowRoot);
    }
  }
}

export function ChatKitPanel() {
  const getClientSecret = useMemo(
    () => createClientSecretFetcher(workflowId),
    []
  );
  const chatkit = useChatKit({ api: { getClientSecret } });

  useEffect(() => {
    // Run immediately
    scanAndPatch();

    // Re-run repeatedly because ChatKit rerenders
    const iv = window.setInterval(scanAndPatch, 250);

    return () => window.clearInterval(iv);
  }, []);

  return (
    <div
      id="skillport-chatkit-root"
      className="flex h-[90vh] w-full rounded-2xl bg-white shadow-sm transition-colors dark:bg-slate-900"
    >
      <ChatKit control={chatkit.control} className="h-full w-full" />
    </div>
  );
}
