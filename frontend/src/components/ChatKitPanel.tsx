import { useEffect, useMemo } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { createClientSecretFetcher, workflowId } from "../lib/chatkitSession";

export function ChatKitPanel() {
  const getClientSecret = useMemo(
    () => createClientSecretFetcher(workflowId),
    []
  );

  // IMPORTANT: do NOT pass ui/locale/startScreen/composer here (your version rejects them)
  const chatkit = useChatKit({
    api: { getClientSecret },
  });

  useEffect(() => {
    const ROOT_ID = "skillport-chatkit-root";

    const replacements: Array<[string, string]> = [
      ["What can I help with today?", "Waarmee kan ik je vandaag helpen?"],
      ["Message the AI", "Stel je vraag aan Skillport…"],
    ];

    const patchTextNodes = (root: ParentNode) => {
      // Replace visible text by walking text nodes
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node: Node | null;
      while ((node = walker.nextNode())) {
        const value = (node.nodeValue || "").trim();
        for (const [from, to] of replacements) {
          if (value === from)
            node.nodeValue = node.nodeValue!.replace(from, to);
        }
      }

      // Replace placeholder / aria-label (input can be inside shadow DOM)
      const inputs = (root as ParentNode).querySelectorAll?.(
        "textarea, input"
      ) as NodeListOf<HTMLInputElement | HTMLTextAreaElement> | undefined;

      inputs?.forEach((el) => {
        if (el.getAttribute("placeholder") === "Message the AI") {
          el.setAttribute("placeholder", "Stel je vraag aan Skillport…");
        }
        if (el.getAttribute("aria-label") === "Message the AI") {
          el.setAttribute("aria-label", "Stel je vraag aan Skillport…");
        }
      });
    };

    const patchAll = () => {
      // 1) Patch normal DOM under our root
      const container = document.getElementById(ROOT_ID) ?? document.body;
      patchTextNodes(container);

      // 2) Patch ChatKit shadow DOM (openai-chatkit element)
      const chatkitEl = document.querySelector("openai-chatkit") as any;
      if (chatkitEl?.shadowRoot) {
        patchTextNodes(chatkitEl.shadowRoot as ShadowRoot);

        // Some apps nest more shadow roots – patch them too
        const shadowHosts = Array.from(
          chatkitEl.shadowRoot.querySelectorAll("*")
        ).filter((el: any) => el && (el as any).shadowRoot) as any[];

        for (const host of shadowHosts) {
          patchTextNodes(host.shadowRoot as ShadowRoot);
        }
      }
    };

    patchAll();

    // Re-apply on rerenders
    const obs = new MutationObserver(() => patchAll());
    obs.observe(document.documentElement, { childList: true, subtree: true });

    return () => obs.disconnect();
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
