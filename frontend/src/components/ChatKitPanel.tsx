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
    ui: {
      startScreen: {
        title: "Waarmee kan ik je vandaag helpen?",
        subtitle: "Ik help je graag met vragen over Skillport en Wet DBA.",
      },
      composer: {
        placeholder: "Stel je vraag aan Skillport…",
        submitLabel: "Versturen",
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
