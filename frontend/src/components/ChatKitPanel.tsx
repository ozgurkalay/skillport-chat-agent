import { useEffect, useMemo } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { createClientSecretFetcher, workflowId } from "../lib/chatkitSession";

const STARTER_MESSAGE = "Hallo! Ik ben Skillport, je digitale assistent. Laat me weten waarmee ik je kan helpen.";
const PLACEHOLDER_MESSAGE = "Stel je vraag aan Skillport…";

export function ChatKitPanel() {
  const getClientSecret = useMemo(() => {
    // 1. Get the userId from the URL query parameters (?userId=...)
    // This comes from the main website's iframe src
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId') || 'anonymous-' + Math.random().toString(36).substr(2, 9);
    
    // 2. Create the fetcher using this unique user identity
    return createClientSecretFetcher(workflowId, userId);
  }, []);

  const chatkit = useChatKit({
    api: { getClientSecret },
    startScreen: {
      greeting: STARTER_MESSAGE,
    },
    composer: {
      placeholder: PLACEHOLDER_MESSAGE,
    },
  });

  // ... (the rest of the useEffect for translations remains exactly the same)
  useEffect(() => {
    // (Existing MutationObserver logic here...)
    // [Keep your existing code for translations and placeholders]
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
