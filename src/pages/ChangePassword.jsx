import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import PasswordInput from '../components/PasswordInput'

export default function ChangePassword() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setMessage(null)
    setSaving(true)
    try {
      await api.put('/users/me/change-password', form)
      setMessage('success')
    } catch (err) {
      const detail = err.response?.data?.detail
      setErrors({ form: typeof detail === 'string' ? detail : 'Something went wrong' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
          Change Password
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">Update your account password.</p>
      </header>

      <div className="p-8 bg-surface-container-low border border-outline-variant max-w-xl">
        {message === 'success' && (
          <div className="bg-secondary-container/30 border border-secondary-container text-on-secondary-container p-3 mb-6 font-body-md text-body-md">
            Password changed successfully.
          </div>
        )}
        {errors.form && (
          <div className="bg-error-container/30 border border-error/50 text-error p-3 mb-6 font-body-md text-body-md">
            {errors.form}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">Current Password</label>
              <PasswordInput
                value={form.current_password}
                onChange={set('current_password')}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">New Password</label>
              <PasswordInput
                value={form.new_password}
                onChange={set('new_password')}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">Confirm New Password</label>
              <PasswordInput
                value={form.confirm_password}
                onChange={set('confirm_password')}
                placeholder="Repeat new password"
              />
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="px-8 py-3 border border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
