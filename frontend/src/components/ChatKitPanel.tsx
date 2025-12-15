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
    const root =
      document.getElementById("skillport-chatkit-root") ?? document.body;

    const replaceInContainer = (container: ParentNode) => {
      // Replace welcome title
      const headings = Array.from(container.querySelectorAll("h1, h2, h3"));
      for (const h of headings) {
        const t = (h.textContent || "").trim();
        if (t === "What can I help with today?") {
          h.textContent = "Waarmee kan ik je vandaag helpen?";
        }
      }

      // Replace input placeholder
      const input =
        container.querySelector("textarea") ||
        container.querySelector('input[type="text"]');

      if (input) {
        input.setAttribute("placeholder", "Stel je vraag aan Skillport…");
        // sometimes ChatKit uses aria-label instead of placeholder
        if (input.getAttribute("aria-label") === "Message the AI") {
          input.setAttribute("aria-label", "Stel je vraag aan Skillport…");
        }
      }

      // Replace any aria-label usage (send button / composer etc.)
      const aria = Array.from(container.querySelectorAll("[aria-label]"));
      for (const el of aria) {
        const v = el.getAttribute("aria-label");
        if (v === "Message the AI") {
          el.setAttribute("aria-label", "Stel je vraag aan Skillport…");
        }
      }
    };

    const applyDutch = () => {
      // normal DOM
      replaceInContainer(root);

      // Shadow DOM (important!)
      const all = Array.from(root.querySelectorAll("*"));
      for (const el of all) {
        const anyEl = el as any;
        if (anyEl && anyEl.shadowRoot) {
          replaceInContainer(anyEl.shadowRoot as ShadowRoot);
        }
      }
    };

    applyDutch();

    const obs = new MutationObserver(() => applyDutch());
    obs.observe(root, { subtree: true, childList: true, attributes: true });

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
