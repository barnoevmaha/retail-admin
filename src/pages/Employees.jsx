import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'
import { useAuth } from '../context/AuthContext'

const ROLES = ['admin', 'manager', 'cashier', 'warehouse_employee']

const roleLabel = (r) => {
  const k = `employees.role_${r}`
  const v = t(k)
  return v === k ? r : v
}

const empty = { email: '', password: '', name: '', role: 'cashier' }

export default function Employees() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const load = () => api.get('/users/').then((r) => setUsers(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!form.name.trim() || !form.email.trim()) { setErr(t('employees.fill_all')); return }
    try {
      if (editing) {
        const body = { name: form.name.trim(), email: form.email.trim(), role: form.role }
        if (form.password) body.password = form.password
        await api.put(`/users/${editing}`, body)
        setMsg(t('employees.updated'))
      } else {
        if (!form.password) { setErr(t('employees.password_required')); return }
        await api.post('/users/', { ...form, name: form.name.trim(), email: form.email.trim() })
        setMsg(t('employees.created'))
      }
      setForm(empty); setEditing(null)
      load()
    } catch (ex) {
      setErr(ex.response?.data?.detail || t('common.unknown'))
    }
  }

  const startEdit = (u) => {
    setEditing(u.id)
    setForm({ name: u.name || '', email: u.email, password: '', role: u.role })
    setMsg(''); setErr('')
  }

  const toggleActive = async (u) => {
    try {
      await api.put(`/users/${u.id}`, { is_active: !u.is_active })
      load()
    } catch (ex) { setErr(ex.response?.data?.detail || t('common.unknown')) }
  }

  if (user?.role !== 'super_admin') {
    return (
      <div className="p-8 font-body-md text-body-md text-on-surface-variant">
        {t('employees.denied')}
      </div>
    )
  }

  const inputClass =
    'w-full bg-transparent border-0 border-b border-outline-variant text-on-surface font-body-lg text-body-lg py-2 px-0 focus:ring-0 focus:outline-none focus:border-secondary transition-colors duration-300'

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
          {t('employees.title')}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">{t('employees.subtitle')}</p>
      </header>

      {(msg || err) && (
        <p className={`font-body-md text-body-md ${err ? 'text-error' : 'text-secondary'}`}>{err || msg}</p>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] items-end gap-6 border border-outline-variant rounded-[4px] bg-surface-container-low p-6">
        <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
          {t('employees.name')}
          <input className={inputClass + ' mt-2'} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
          {t('employees.login')}
          <input className={inputClass + ' mt-2'} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
          {t('employees.password')}
          <input className={inputClass + ' mt-2'} type="text" value={form.password} placeholder={editing ? '••••••••' : ''} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
          {t('employees.role')}
          <select className={inputClass + ' mt-2 cursor-pointer'} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
          </select>
        </label>
        <button type="submit" className="px-6 py-2 border border-outline-variant rounded-[4px] font-label-sm text-label-sm text-on-surface hover:border-secondary hover:text-secondary transition-colors duration-300">
          {editing ? t('common.save') : t('common.create')}
        </button>
      </form>

      <div className="bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container">
              <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t('employees.name')}</th>
              <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t('employees.login')}</th>
              <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t('employees.role')}</th>
              <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t('common.status')}</th>
              <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right w-32">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-surface-container/50 transition-colors duration-200 group">
                <td className="py-4 px-6 font-body-lg text-body-lg text-primary">
                  {u.name || '—'}
                  {u.role === 'super_admin' && (
                    <span className="ml-3 font-label-sm text-label-sm text-secondary uppercase tracking-wider">{t('employees.me')}</span>
                  )}
                </td>
                <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{u.email}</td>
                <td className="py-4 px-6 font-body-md text-body-md text-primary">{roleLabel(u.role)}</td>
                <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">
                  {u.is_active ? t('employees.active') : t('employees.inactive')}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {u.role !== 'super_admin' && (
                      <>
                        <button onClick={() => startEdit(u)} className="text-on-surface-variant hover:text-primary transition-colors" title={t('common.edit')}>
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => toggleActive(u)} className="text-on-surface-variant hover:text-primary transition-colors" title={u.is_active ? t('employees.disable') : t('employees.enable')}>
                          <span className="material-symbols-outlined text-[20px]">{u.is_active ? 'block' : 'check_circle'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="py-16 text-center font-body-md text-body-md text-on-surface-variant">{t('employees.no_yet')}</div>
        )}
      </div>
    </div>
  )
}
