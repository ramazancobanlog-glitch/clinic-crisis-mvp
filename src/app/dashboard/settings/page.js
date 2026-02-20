'use client';

import { useState } from 'react';

export default function SettingsPage() {
    const [toast, setToast] = useState(null);
    const [clinic, setClinic] = useState({
        name: 'Örnek Doğum Kliniği',
        address: 'Atatürk Cad. No:42, Muğla',
        phone: '0252 214 00 00',
        email: 'info@ornekdogum.com',
        bedCapacity: 16,
        orCount: 4,
    });

    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        smsAlerts: false,
        soundAlerts: true,
        autoAckTimeout: 5,
    });

    const handleSave = () => {
        setToast({ type: 'success', message: 'Ayarlar başarıyla kaydedildi' });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="fade-in">
            {toast && (
                <div className="toast-container">
                    <div className={`toast ${toast.type}`}>
                        <span className="toast-icon">✅</span>
                        <span className="toast-message">{toast.message}</span>
                    </div>
                </div>
            )}

            <div className="two-col-grid">
                {/* Klinik Bilgileri */}
                <div className="data-section">
                    <div className="data-section-header">
                        <div className="data-section-title">🏥 Klinik Bilgileri</div>
                    </div>
                    <div style={{ padding: '24px' }}>
                        <div className="form-group">
                            <label>Klinik Adı</label>
                            <input type="text" value={clinic.name} onChange={e => setClinic({ ...clinic, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Adres</label>
                            <input type="text" value={clinic.address} onChange={e => setClinic({ ...clinic, address: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-group">
                                <label>Telefon</label>
                                <input type="text" value={clinic.phone} onChange={e => setClinic({ ...clinic, phone: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>E-posta</label>
                                <input type="email" value={clinic.email} onChange={e => setClinic({ ...clinic, email: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-group">
                                <label>Yatak Kapasitesi</label>
                                <input type="number" value={clinic.bedCapacity} onChange={e => setClinic({ ...clinic, bedCapacity: parseInt(e.target.value) })} />
                            </div>
                            <div className="form-group">
                                <label>Ameliyathane Sayısı</label>
                                <input type="number" value={clinic.orCount} onChange={e => setClinic({ ...clinic, orCount: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={handleSave}>💾 Kaydet</button>
                    </div>
                </div>

                {/* Bildirim Ayarları */}
                <div className="data-section">
                    <div className="data-section-header">
                        <div className="data-section-title">🔔 Bildirim Ayarları</div>
                    </div>
                    <div style={{ padding: '24px' }}>
                        {[
                            { key: 'emailAlerts', label: 'E-posta Bildirimleri', desc: 'Kriz alarmlarında e-posta gönder' },
                            { key: 'smsAlerts', label: 'SMS Bildirimleri', desc: 'Kriz alarmlarında SMS gönder (ek ücret)' },
                            { key: 'soundAlerts', label: 'Sesli Uyarılar', desc: 'Dashboard\'da sesli alarm çal' },
                        ].map(setting => (
                            <div key={setting.key} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--border)', marginBottom: '12px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{setting.label}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{setting.desc}</div>
                                </div>
                                <label style={{
                                    position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={notifications[setting.key]}
                                        onChange={() => setNotifications({ ...notifications, [setting.key]: !notifications[setting.key] })}
                                        style={{ display: 'none' }}
                                    />
                                    <span style={{
                                        position: 'absolute', inset: 0, borderRadius: '13px',
                                        background: notifications[setting.key] ? 'var(--accent-blue)' : 'var(--border-light)',
                                        transition: 'background 0.3s',
                                    }}>
                                        <span style={{
                                            position: 'absolute', top: '3px', width: '20px', height: '20px', borderRadius: '50%',
                                            background: 'white', transition: 'left 0.3s',
                                            left: notifications[setting.key] ? '25px' : '3px',
                                        }}></span>
                                    </span>
                                </label>
                            </div>
                        ))}

                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label>Otomatik Onay Zaman Aşımı (dakika)</label>
                            <input type="number" value={notifications.autoAckTimeout} onChange={e => setNotifications({ ...notifications, autoAckTimeout: parseInt(e.target.value) })} />
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Belirtilen süre içinde onaylanmayan alarmlar otomatik olarak eskalade edilir</span>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={handleSave}>💾 Kaydet</button>
                    </div>
                </div>
            </div>

            {/* KVKK ve Güvenlik */}
            <div className="data-section" style={{ marginTop: '24px' }}>
                <div className="data-section-header">
                    <div className="data-section-title">🔒 Güvenlik & KVKK</div>
                </div>
                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        {[
                            { icon: '🔐', title: 'Veri Şifreleme', desc: 'AES-256 şifreleme aktif', status: 'Aktif', color: 'var(--accent-green)' },
                            { icon: '📝', title: 'Denetim İzi (Audit Log)', desc: 'Tüm işlemler loglanıyor', status: 'Aktif', color: 'var(--accent-green)' },
                            { icon: '🛡️', title: 'TC Kimlik Maskeleme', desc: 'TC No otomatik maskeleniyor', status: 'Aktif', color: 'var(--accent-green)' },
                            { icon: '⏰', title: 'Oturum Zaman Aşımı', desc: '24 saat otomatik çıkış', status: '24 Saat', color: 'var(--accent-blue)' },
                            { icon: '🔄', title: 'Yedekleme', desc: 'Günlük otomatik yedekleme', status: 'Yapılandır', color: 'var(--accent-yellow)' },
                            { icon: '📊', title: 'KVKK Raporları', desc: 'Veri işleme raporları', status: 'Oluştur', color: 'var(--accent-blue)' },
                        ].map(item => (
                            <div key={item.title} style={{
                                padding: '20px', borderRadius: 'var(--radius-sm)',
                                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                                display: 'flex', gap: '12px', alignItems: 'flex-start'
                            }}>
                                <span style={{ fontSize: '24px' }}>{item.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.title}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: item.color, padding: '4px 10px', borderRadius: '12px', background: `${item.color}18` }}>{item.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
