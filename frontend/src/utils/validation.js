import { MIN_PASTE_TEXT_LENGTH, MAX_FILE_SIZE_BYTES, ACCEPTED_MIME_TYPES } from './constants.js'

export function validatePastedText(text) {
  const trimmed = (text || '').trim()
  if (!trimmed) {
    return { valid: false, message: 'Text is empty. Please provide content.' }
  }
  if (trimmed.length < MIN_PASTE_TEXT_LENGTH) {
    return {
      valid: false,
      message: `Text is too short (minimum ${MIN_PASTE_TEXT_LENGTH} characters). Please provide more detail.`,
    }
  }
  return { valid: true }
}

export function validateFile(file) {
  if (!file) {
    return { valid: false, message: 'No file selected.' }
  }
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: `Unsupported file type '${file.type || 'unknown'}'. Supported types: PDF, plain text.`,
    }
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      message: `File '${file.name}' exceeds the maximum size of 5MB.`,
    }
  }
  return { valid: true }
}

export function isDocumentValid(doc) {
  if (!doc) return false
  if (doc.type === 'text') {
    return validatePastedText(doc.value).valid
  }
  if (doc.type === 'file') {
    return validateFile(doc.value).valid
  }
  return false
}
