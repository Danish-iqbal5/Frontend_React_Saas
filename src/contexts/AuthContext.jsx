import React, { createContext, useState, useEffect, useContext } from 'react'
import api from '../services/api'
import {jwtDecode} from 'jwt-decode'


const AuthContext = createContext(null)


export const AuthProvider = ({ children }) => {
const [accessToken, setAccessToken] = useState(() => localStorage.getItem('access') || null)
const [user, setUser] = useState(() => {
const token = localStorage.getItem('access')
if (!token) return null
try { return jwtDecode(token) } catch { return null }
})


useEffect(() => {
const req = api.interceptors.request.use(config => {
if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
return config
})
return () => api.interceptors.request.eject(req)
}, [accessToken])


const login = async ({email, password}) => {
const res = await api.post('/login/', {email, password})
const { access, refresh } = res.data

localStorage.setItem('access', access)
localStorage.setItem('refresh', refresh)
setAccessToken(access)
try { setUser(jwtDecode(access)) } catch { setUser(null) }
}


const logout = () => {
localStorage.removeItem('access')
localStorage.removeItem('refresh')
setAccessToken(null)
setUser(null)
}


const refreshAccess = async () => {
const refresh = localStorage.getItem('refresh')
if (!refresh) throw new Error('No refresh token')
const res = await api.post('/refresh/', { refresh })
const { access } = res.data
localStorage.setItem('access', access)
setAccessToken(access)
try { setUser(jwtDecode(access)) } catch { setUser(null) }
return access
}


return (
<AuthContext.Provider value={{ user, accessToken, login, logout, refreshAccess }}>
{children}
</AuthContext.Provider>
)
}


export const useAuth = () => useContext(AuthContext)