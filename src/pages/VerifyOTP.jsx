import React, { useState } from 'react'
import api from '../services/api'
import { useLocation, useNavigate } from 'react-router-dom'


export default function VerifyOTP(){
const location = useLocation()
const nav = useNavigate()
const email = location.state?.email || ''
const userType = location.state?.userType || 'normal'


const [otp, setOtp] = useState('')
const [message, setMessage] = useState('')
const [loading, setLoading] = useState(false)


const handleVerify = async e => {
e.preventDefault()
setLoading(true)
setMessage('')
try{
const res = await api.post('/api/verify-otp/', { email, otp },
    { headers: { 'Content-Type': 'application/json' } }
)

const data = res.data
if (data.requires_admin_approval || userType === 'vendor' || userType === 'vip_customer') {
setMessage('Email verified. Await admin approval. You will receive email with set-password link after approval.')
} else if (data.set_password_direct) {

nav('/reset-password', { state: { email, fromVerify: true, user_id: data.user_id } })
return
} else if (data.user_id) {
setMessage('Verified. You will receive an email to set your password.')
} else {
setMessage(data.detail || 'Verified. Follow email instructions.')
}
} catch (err) {
setMessage(err.response?.data?.detail || 'OTP verification failed')
} finally { setLoading(false) }
}


const handleResend = async () => {
setLoading(true)
setMessage('')
try{
await api.post('/api/resend-otp/', { email })
setMessage('OTP resent.')
} catch (err){ setMessage('Failed to resend OTP') }
finally{ setLoading(false) }
}

    
return (
<div className="card">
<h2>Verify OTP</h2>
<p>Verifying email: <strong>{email}</strong> (type: {userType})</p>
<form onSubmit={handleVerify}>
<div className="field">
<label>OTP</label>
<input value={otp} onChange={e => setOtp(e.target.value)} required />
</div>
<div style={{display:'flex', gap:8}}>
<button className="btn" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
<button type="button" className="btn secondary" onClick={handleResend} disabled={loading}>Resend OTP</button>
</div>
</form>
{message && <p className="msg">{message}</p>}
</div>
)
}
