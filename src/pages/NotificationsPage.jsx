import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

const CHANNELS = ['sms', 'email', 'telegram', 'push']

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
      alert(t('common.error_msg', { detail: err.response?.data?.detail || t('common.unknown') }))
    }
  }

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      fetch()
    } catch {}
  }

  const channelIcon = { sms: 'chat', email: 'mail', telegram: 'send', push: 'notifications' }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
          {t('notifications.title')}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">{t('notifications.subtitle')}</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Send */}
        <section className="col-span-12 lg:col-span-5">
          <div className="p-8 bg-surface-container-low border border-outline-variant">
            <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-6">{t('notifications.send')}</h2>
            <div className="space-y-6">
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-3">{t('notifications.channel')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {CHANNELS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setChannel(c)}
                      className={`py-3 flex flex-col items-center gap-1 border font-label-sm text-label-sm uppercase tracking-widest transition-colors ${
                        (channel || 'sms') === c
                          ? 'border-secondary text-secondary bg-surface-container'
                          : 'border-outline-variant text-on-surface-variant hover:border-secondary'
                      }`}
                    >
                      <span className="material-symbols-outlined">{channelIcon[c]}</span>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">{t('notifications.recipient')}</label>
                <input
                  type="text" placeholder={t("notifications.recipient_placeholder")}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-md placeholder:text-on-surface-variant/40"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">{t('notifications.title_label')}</label>
                <input
                  type="text" placeholder={t("common.optional")}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-md placeholder:text-on-surface-variant/40"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">{t('notifications.message')}</label>
                <textarea
                  rows="3" placeholder={t("notifications.message_placeholder")}
                  className="w-full bg-transparent border border-outline-variant focus:border-secondary outline-none p-3 text-body-md resize-none placeholder:text-on-surface-variant/40"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <button onClick={send} className="w-full py-3 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">send</span>
                {t('notifications.send_btn')}
              </button>
            </div>
          </div>
        </section>

        {/* Right: History */}
        <section className="col-span-12 lg:col-span-7">
          <div className="p-8 bg-surface-container-low border border-outline-variant">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">{t('notifications.sent')}</h2>
              <div className="flex gap-1 p-1 bg-surface-container rounded-[4px]">
                <button
                  onClick={() => setChannel('')}
                  className={`px-3 py-1 text-label-sm text-sm rounded-[4px] transition-colors ${!channel ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  {t('notifications.all')}
                </button>
                {CHANNELS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setChannel(c)}
                    className={`px-3 py-1 text-label-sm text-sm rounded-[4px] transition-colors ${channel === c ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:text-primary'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div key={n.id} className="border border-outline-variant p-4 hover:border-secondary/50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary text-[18px]">{channelIcon[n.channel] || 'notifications'}</span>
                        <span className="font-body-md text-body-md text-on-surface font-medium uppercase tracking-wider">{n.channel}</span>
                        <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-[2px] ${
                          n.status === 'sent'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-error-container text-on-error-container'
                        }`}>
                          {t('status.' + n.status)}
                        </span>
                      </div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">{n.recipient}</p>
                      {n.title && <p className="font-body-md text-body-md text-on-surface font-medium mt-1">{n.title}</p>}
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1">{n.message}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant/50 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                    {!n.read_at && n.status === 'sent' && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="shrink-0 px-4 py-2 border border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all"
                      >
                        {t('notifications.mark_read')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="py-16 text-center font-body-md text-body-md text-on-surface-variant/60">{t('notifications.no_yet')}</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
