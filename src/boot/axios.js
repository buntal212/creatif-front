import { defineBoot } from '#q-app'
import axios from 'axios'

const configuredBaseUrl = import.meta.env.QCLI_API_BASE_URL

if (!configuredBaseUrl) {
  throw new Error(
    'QCLI_API_BASE_URL wajib diatur. Periksa file environment yang dipakai saat build.',
  )
}

let baseURL

try {
  const url = new URL(configuredBaseUrl)
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Protokol URL API harus HTTP atau HTTPS.')
  }
  baseURL = url.toString().replace(/\/$/, '')
} catch (error) {
  throw new Error(
    `QCLI_API_BASE_URL tidak valid: ${error instanceof Error ? error.message : configuredBaseUrl}`,
    { cause: error },
  )
}

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('creative_auth_token')

  if (token) config.headers.Authorization = `Bearer ${token}`

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const responseData = error.response?.data
    const validationMessage = responseData?.errors
      ? Object.values(responseData.errors).flat().find((message) => typeof message === 'string')
      : null

    if (validationMessage || responseData?.message) {
      error.message = validationMessage || responseData.message
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Tidak dapat terhubung ke server. Periksa URL API dan koneksi Anda.'
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Permintaan ke server melebihi batas waktu. Silakan coba lagi.'
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('creative_auth_token')
      localStorage.removeItem('creative_auth_user')

      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  },
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
