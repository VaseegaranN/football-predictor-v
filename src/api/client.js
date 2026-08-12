export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function request(path, init) {
  const res = await fetch(path, init)

  if (!res.ok) {
    let message = `Request failed with ${res.status}`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // non-JSON error body; keep the status-based message
    }
    throw new ApiError(message, res.status)
  }

  return res.json()
}
