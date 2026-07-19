export function formatError(error) {
  if (!error) {
    return 'Something went wrong. Please try again.'
  }

  if (error.request && !error.response) {
    return "Can't reach the backend. Make sure it's running and that this origin is in the backend's CORS_ORIGINS."
  }

  const status = error.response?.status
  const envelope = error.response?.data

  if (status === 400) {
    return envelope?.message || 'Invalid input. Please check your data and try again.'
  }

  if (status === 502) {
    return 'The AI service is having trouble right now — please try again in a moment.'
  }

  if (status === 500) {
    return 'Something went wrong on our end. Please try again.'
  }

  if (envelope?.message) {
    return envelope.message
  }

  return 'Something went wrong. Please try again.'
}
