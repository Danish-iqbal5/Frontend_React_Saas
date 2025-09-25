import React, { useState } from 'react'
export default function ResetPassword(){
const loc = useLocation()
const user_id = loc.state?.user_id || new URLSearchParams(window.location.search).get('user_id')
const token = new URLSearchParams(window.location.search).get('token')


const [otp, setOtp] = useState('')
const [password, setPassword] = useState('')
const [confirm, setConfirm] = useState('')
const [message, setMessage] = useState('')
const [loading, setLoading] = useState(false)


const handleSubmit = async e => {
e.preventDefault()
if (password !== confirm) { setMessage('Passwords do not match'); return }
setLoading(true); setMessage('')
try{
if (user_id) {
await api.post(`/set-password/${user_id}/`, { password })
setMessage('Password set. You can now login.')
return
}

await api.post('/reset-password/', { otp, password })
setMessage('Password reset successful. You can now login.')
} catch (err){
setMessage(err.response?.data?.detail || 'Failed to set password')
} finally{ setLoading(false) }
}


return (
<div className="card">
<h2>Set / Reset password</h2>
<form onSubmit={handleSubmit}>
{!user_id && (
<div className="field">
<label>OTP from email</label>
<input value={otp} onChange={e => setOtp(e.target.value)} required />
</div>
)}
<div className="field">
<label>New password</label>
<input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
</div>
<div className="field">
<label>Confirm password</label>
<input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
</div>
<button className="btn" disabled={loading}>{loading ? 'Saving...' : 'Save password'}</button>
</form>
{message && <p className="msg">{message}</p>}
</div>
)
}