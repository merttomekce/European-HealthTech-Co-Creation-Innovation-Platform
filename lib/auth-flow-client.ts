export type AuthFlowResult = {
  email: string;
  registered: boolean;
  nextPath: string;
};

export async function resolveAuthFlowClient(email: string): Promise<AuthFlowResult> {
  const response = await fetch('/api/auth/resolve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'Could not resolve auth flow.');
  }

  return data as AuthFlowResult;
}
