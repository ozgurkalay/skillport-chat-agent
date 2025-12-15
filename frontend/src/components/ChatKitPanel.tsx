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

  // --- UI language patch (Dutch) ---
  useEffect(() => {
    const panel =
      document.getElementById("skillport-chatkit-root") ?? document.body;

    const applyDutchUI = () => {
      // 1) Input placeholder
      const input =
        document.querySelector("textarea") ||
        document.querySelector('input[type="text"]');

      if (input) {
        input.setAttribute("placeholder", "Stel je vraag aan Skillport…");
      }

      // 2) Big welcome headline (often rendered as a large h1)
      const headings = Array.from(document.querySelectorAll("h1, h2, h3"));
      for (const h of headings) {
        const t = (h.textContent || "").trim();
        if (t === "What can I help with today?") {
          h.textContent = "Waarmee kan ik je vandaag helpen?";
        }
      }
    };

    // Run once immediately
    applyDutchUI();

    // Keep re-applying when ChatKit rerenders
    const obs = new MutationObserver(() => applyDutchUI());
    obs.observe(panel, { subtree: true, childList: true });

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
