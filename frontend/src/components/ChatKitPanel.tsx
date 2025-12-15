import { useMemo } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { createClientSecretFetcher, workflowId } from "../lib/chatkitSession";

export function ChatKitPanel() {
  const getClientSecret = useMemo(
    () => createClientSecretFetcher(workflowId),
    []
  );

  const chatkit = useChatKit({
    api: { getClientSecret },

    // ✅ UI language + strings
    ui: {
      locale: "nl-NL",
      composer: {
        placeholder: "Stel je vraag aan Skillport…",
      },
      startScreen: {
        // Some versions use "title", others use "greeting".
        // We include BOTH to maximize compatibility.
        title: "Waarmee kan ik je vandaag helpen?",
        greeting: "Waarmee kan ik je vandaag helpen?",

        // Starter prompts
        prompts: [
          {
            name: "Wet DBA uitgelegd",
            prompt:
              "Kun je in eenvoudige taal uitleggen wat de Wet DBA betekent?",
            icon: "info",
          },
          {
            name: "Modelovereenkomst",
            prompt: "Hoe helpt Skillport mij met een modelovereenkomst?",
            icon: "write",
          },
          {
            name: "Risico-check",
            prompt: "Welke risico’s checkt Skillport in een dossier?",
            icon: "search",
          },
        ],
      },
    },
  });

  return (
    <div
      id="skillport-chatkit-root"
      className="flex h-[90vh] w-full rounded-2xl bg-white shadow-sm transition-colors dark:bg-slate-900"
    >
      <ChatKit control={chatkit.control} className="h-full w-full" />
    </div>
  );
}
