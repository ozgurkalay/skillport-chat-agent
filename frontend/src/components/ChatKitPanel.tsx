import { useEffect, useMemo } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { createClientSecretFetcher, workflowId } from "../lib/chatkitSession";

const STARTER_MESSAGE = "Hallo! Ik ben Skillport, je digitale assistent. Laat me weten waarmee ik je kan helpen.";
const PLACEHOLDER_MESSAGE = "Stel je vraag aan Skillport…";

export function ChatKitPanel() {
  // Use a simpler approach to get the userId
  const getClientSecret = useMemo(() => {
    let uid = 'anonymous';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      uid = params.get('userId') || 'anonymous-' + Math.random().toString(36).substring(7);
    }
    return createClientSecretFetcher(workflowId, uid);
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

  // Keep your existing translation useEffect here...
  useEffect(() => {
    // [Your existing code for MutationObserver / patchAll]
  }, []);

  // Check if chatkit.control is ready
  if (!chatkit.control) {
    return <div className="p-8 text-center">Inladen...</div>;
  }

  return (
    <div
      id="skillport-chatkit-root"
      className="flex h-[90vh] w-full rounded-2xl bg-white shadow-sm transition-colors dark:bg-slate-900"
    >
      <ChatKit control={chatkit.control} className="h-full w-full" />
    </div>
  );
}
