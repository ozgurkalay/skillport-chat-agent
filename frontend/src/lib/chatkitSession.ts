export const workflowId = "clzi08q75003cstc480y349on";

export function createClientSecretFetcher(workflowId: string, userId: string) {
  return async () => {
    // Now sending both workflowId AND userId to your backend API
    const response = await fetch("/api/create-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ workflowId, userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to create session");
    }

    const { client_secret } = await response.json();
    return client_secret;
  };
}
