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
      if (typeof detail === 'string') {
        setErrors({ form: detail })
      } else {
        setErrors({ form: 'An error occurred' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>
      <div className="bg-white rounded-lg shadow p-4 max-w-xl">
        {message === 'success' && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm border border-green-200">
            Password changed successfully.
          </div>
        )}
        {errors.form && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm border border-red-200">
            {errors.form}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <PasswordInput
              value={form.current_password}
              onChange={set('current_password')}
              placeholder="Enter current password"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <PasswordInput
              value={form.new_password}
              onChange={set('new_password')}
              placeholder="Enter new password"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <PasswordInput
              value={form.confirm_password}
              onChange={set('confirm_password')}
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}