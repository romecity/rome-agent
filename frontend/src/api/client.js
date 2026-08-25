const API_URL = import.meta.env.VITE_API_URL ||
  'https://3a8k92d19b.execute-api.us-east-1.amazonaws.com/v1'

/**
 * Send a query to the Rome AI Agent API.
 * @param {string} question - The user's question
 * @returns {Promise<{answer: string, sources: Array, latency_ms: number}>}
 */
export async function sendQuery(question) {
  const response = await fetch(`${API_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`)
  }

  return data
}

/**
 * Check the API health status.
 * @returns {Promise<{status: string, version: string, environment: string}>}
 */
export async function checkHealth() {
  const response = await fetch(`${API_URL}/health`)
  return response.json()
}
