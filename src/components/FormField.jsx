import React from 'react'


export default function FormField({label, id, type='text', value, onChange, placeholder}){
return (
<div className="field">
<label htmlFor={id}>{label}</label>
<input id={id} value={value} onChange={onChange} type={type} placeholder={placeholder} />
</div>
)
}