import { useEffect, useMemo } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { createClientSecretFetcher, workflowId } from "../lib/chatkitSession";

export function ChatKitPanel() {
  const getClientSecret = useMemo(
    () => createClientSecretFetcher(workflowId),
    []
  );

  const chatkit = useChatKit({
    api: { getClientSecret },
  });

  useEffect(() => {
    console.log("[Skillport] UI patch mounted");

    const replacements: Array<[string, string]> = [
      ["What can I help with today?", "Waarmee kan ik je vandaag helpen?"],
      ["Message the AI", "Stel je vraag aan Skillport…"],
    ];

    const patchTextNodes = (root: ParentNode) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const txt = (node.nodeValue || "").trim();
        for (const [from, to] of replacements) {
          if (txt === from) node.nodeValue = to;
        }
      }

      const inputs = (root as any).querySelectorAll?.("textarea, input");
      inputs?.forEach((el: any) => {
        if (el.getAttribute("placeholder") === "Message the AI") {
          el.setAttribute("placeholder", "Stel je vraag aan Skillport…");
        }
        if (el.getAttribute("aria-label") === "Message the AI") {
          el.setAttribute("aria-label", "Stel je vraag aan Skillport…");
        }
      });
    };

    const patchAll = () => {
      const chatkitEl = document.querySelector("openai-chatkit") as any;

      console.log(
        "[Skillport] openai-chatkit found?",
        !!chatkitEl,
        "shadowRoot?",
        !!chatkitEl?.shadowRoot
      );

      if (chatkitEl?.shadowRoot) {
        patchTextNodes(chatkitEl.shadowRoot);
      }
    };

    patchAll();

    const obs = new MutationObserver(() => patchAll());
    obs.observe(document.documentElement, { childList: true, subtree: true });

    return () => obs.disconnect();
  }, []);

  return (
    <div className="relative flex h-[90vh] w-full rounded-2xl bg-white shadow-sm transition-colors dark:bg-slate-900">
      {/* DEBUG BADGE - if you see this, you are on the new deployed build */}
      <div className="absolute left-3 top-3 z-50 rounded bg-black/70 px-2 py-1 text-xs text-white">
        UI patch v1 active
      </div>

      <ChatKit control={chatkit.control} className="h-full w-full" />
    </div>
  );
}
