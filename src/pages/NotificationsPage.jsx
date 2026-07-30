import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [channel, setChannel] = useState('')
  const [recipient, setRecipient] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  const fetch = () => {
    const params = {}
    if (channel) params.channel = channel
    api.get('/notifications', { params }).then((r) => setNotifications(r.data)).catch(() => {})
  }

  useEffect(() => { fetch() }, [])

  const send = async () => {
    if (!recipient || !message) return
    try {
      await api.post('/notifications/send', { channel: channel || 'sms', recipient, title, message })
      setMessage('')
      setTitle('')
      fetch()
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || 'Unknown'))
    }
  }

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      fetch()
    } catch {}
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('notifications.title')}</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold text-lg mb-3 dark:text-white">{t('notifications.send')}</h2>
          <div className="space-y-3">
            <select value={channel} onChange={(e) => setChannel(e.target.value)}
              className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded px-3 py-2 w-full text-sm">
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="telegram">Telegram</option>
              <option value="push">Push</option>
            </select>
            <input type="text" placeholder={t('notifications.recipient_placeholder')}
              value={recipient} onChange={(e) => setRecipient(e.target.value)}
              className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded px-3 py-2 w-full text-sm" />
            <input type="text" placeholder={t('notifications.title_placeholder')} value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded px-3 py-2 w-full text-sm" />
            <textarea placeholder={t('notifications.message_placeholder')} value={message} onChange={(e) => setMessage(e.target.value)}
              className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded px-3 py-2 w-full text-sm" rows="3" />
            <button onClick={send} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">{t('notifications.send_btn')}</button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold text-lg mb-3 dark:text-white">{t('notifications.sent')}</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.map((n) => (
              <div key={n.id} className="border dark:border-gray-700 rounded p-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium dark:text-gray-200">{n.channel}</span>
                  <div>
                    <span className={`px-2 py-0.5 rounded text-xs ${n.status === 'sent' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}`}>
                      {n.status}
                    </span>
                    {!n.read_at && n.status === 'sent' && (
                      <button onClick={() => markRead(n.id)} className="ml-2 text-blue-500 dark:text-blue-400 text-xs">{t('notifications.mark_read')}</button>
                    )}
                  </div>
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">{n.recipient}</div>
                {n.title && <div className="font-medium mt-1 dark:text-gray-200">{n.title}</div>}
                <div className="text-gray-600 dark:text-gray-300 mt-1">{n.message}</div>
                <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">{new Date(n.created_at).toLocaleString()}</div>
              </div>
            ))}
            {notifications.length === 0 && <div className="text-gray-400 dark:text-gray-500 text-center py-4">{t('notifications.no_sent')}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
