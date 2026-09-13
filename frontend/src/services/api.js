import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15 * 60 * 1000,      // forensics is slow
})

export async function health() {
  const { data } = await api.get('/health')
  return data
}

export async function fetchPlugins() {
  const { data } = await api.get('/plugins')
  return data.plugins
}

export async function fetchImages() {
  const { data } = await api.get('/images')
  return data.images
}

export async function uploadImage(file, onProgress) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/images/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
  return data
}

export async function deleteImage(name) {
  await api.delete(`/images/${encodeURIComponent(name)}`)
}

export async function runAnalysis(image, plugin) {
  const { data } = await api.post('/volatility/run', { image, plugin })
  return data
}

export function extractError(err) {
  return (
    err?.response?.data?.detail ||
    err?.message ||
    'Unexpected error occurred.'
  )
}