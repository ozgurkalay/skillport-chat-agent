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
    const root =
      document.getElementById("skillport-chatkit-root") ?? document.body;

    const applyDutchUI = () => {
      // 1) Replace the big welcome text anywhere (not only h1/h2/h3)
      const all = Array.from(root.querySelectorAll("*"));
      for (const el of all) {
        const t = (el.textContent || "").trim();

        if (t === "What can I help with today?") {
          el.textContent = "Waarmee kan ik je vandaag helpen?";
        }
      }

      // 2) Replace input placeholder text (ChatKit may use input/textarea OR aria-label)
      const input =
        root.querySelector("textarea[placeholder]") ||
        root.querySelector("input[placeholder]") ||
        root.querySelector("textarea") ||
        root.querySelector('input[type="text"]');

      if (input) {
        input.setAttribute("placeholder", "Stel je vraag aan Skillport…");
      }

      // Also try to patch accessibility label text if that's what renders
      const labeled =
        root.querySelector('[aria-label="Message the AI"]') ||
        root.querySelector('[placeholder="Message the AI"]');

      if (labeled) {
        labeled.setAttribute("aria-label", "Stel je vraag aan Skillport…");
        labeled.setAttribute("placeholder", "Stel je vraag aan Skillport…");
      }
    };
    applyDutchUI();
    const obs = new MutationObserver(() => applyDutchUI());
    obs.observe(root, { subtree: true, childList: true });

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
