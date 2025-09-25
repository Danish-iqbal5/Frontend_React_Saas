import axios from 'axios'
import createAuthRefreshInterceptor from 'axios-auth-refresh'


const api = axios.create({
baseURL: 'http://localhost:8000/api/',
headers: { 'Content-Type': 'application/json' }
})



const refreshAuthLogic = async failedRequest => {
const refresh = localStorage.getItem('refresh')
if (!refresh) return Promise.reject('No refresh token')
try {
const resp = await api.post('/refresh/', { refresh })
const { access } = resp.data
localStorage.setItem('access', access)
failedRequest.response.config.headers['Authorization'] = `Bearer ${access}`
return Promise.resolve()
} catch (err) {
localStorage.removeItem('access')
localStorage.removeItem('refresh')
return Promise.reject(err)
}
}



createAuthRefreshInterceptor(api, refreshAuthLogic)


export default api