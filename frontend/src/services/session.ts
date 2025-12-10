// services/session.ts
export async function startSession(projectId: string): Promise<string> {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No access token found");

  const res = await fetch(`http://localhost:8080/api/session/${projectId}/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to start session (${res.status}): ${text}`);
  }

  // SessionController returns just a String sessionId
  const sessionId = await res.text();
  return sessionId;
}
