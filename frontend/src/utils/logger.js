export function logError(context, error) {
  const entry = {
    timestamp: new Date().toISOString(),
    context,
    status: error?.response?.status ?? null,
    message: error?.response?.data?.message ?? error?.message ?? 'Unknown error',
    raw: error,
  }
  console.error('[ERROR]', entry)
}
