export const workflowId = "clzi08q75003cstc480y349on";

export function createClientSecretFetcher(workflowId: string, userId: string) {
  return async () => {
    try {
      const response = await fetch("/api/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workflowId, userId }),
      });

      if (!response.ok) {
        console.error("Failed to fetch client secret");
        throw new Error("Failed to create session");
      }

      const { client_secret } = await response.json();
      return client_secret;
    } catch (error) {
      console.error("ChatKit Auth Error:", error);
      throw error;
    }
  };
}

