import client from './client.js'

export async function getHealth() {
  const response = await client.get('/api/v1/health')
  return response.data
}

export async function analyzeSkillGap({ resume, jd }) {
  const formData = buildFormData(resume, jd)
  const response = await client.post('/api/v1/skill-gap', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  if (!response.data.success) {
    const err = new Error(response.data.message || 'Analysis failed')
    err.response = { data: response.data, status: 400 }
    throw err
  }

  return response.data.data
}

export async function analyzeFitVerdict({ resume, jd }) {
  const formData = buildFormData(resume, jd)
  const response = await client.post('/api/v1/fit-verdict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  if (!response.data.success) {
    const err = new Error(response.data.message || 'Analysis failed')
    err.response = { data: response.data, status: 400 }
    throw err
  }

  return response.data.data
}

function buildFormData(resume, jd) {
  const formData = new FormData()

  if (resume.type === 'file' && resume.value) {
    formData.append('resume_file', resume.value)
  } else if (resume.type === 'text' && resume.value !== undefined) {
    formData.append('resume_text', resume.value)
  }

  if (jd.type === 'file' && jd.value) {
    formData.append('jd_file', jd.value)
  } else if (jd.type === 'text' && jd.value !== undefined) {
    formData.append('jd_text', jd.value)
  }

  return formData
}
