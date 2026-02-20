'use client';

import { useState } from 'react';

const CRISIS_CODES = [
    { id: 1, code: 'CODE_BLUE', name: 'Kod Mavi', subtitle: 'Kardiyak Arrest', color: '#3B82F6', bgColor: 'rgba(59,130,246,0.12)', description: 'Kardiyak veya solunumsal arrest durumu', severity: 5, icon: '🔵' },
    { id: 2, code: 'CODE_PINK', name: 'Kod Pembe', subtitle: 'Yenidoğan Acil', color: '#EC4899', bgColor: 'rgba(236,72,153,0.12)', description: 'Yenidoğan bebek acil durumu', severity: 5, icon: '🩷' },
    { id: 3, code: 'CODE_RED', name: 'Kod Kırmızı', subtitle: 'Acil Sezaryen', color: '#EF4444', bgColor: 'rgba(239,68,68,0.12)', description: 'Acil sezaryen ameliyatı gereksinimi', severity: 5, icon: '🔴' },
    { id: 4, code: 'CODE_ORANGE', name: 'Kod Turuncu', subtitle: 'PPH (Postpartum Kanama)', color: '#F97316', bgColor: 'rgba(249,115,22,0.12)', description: 'Doğum sonrası aşırı kanama', severity: 4, icon: '🟠' },
    { id: 5, code: 'CODE_YELLOW', name: 'Kod Sarı', subtitle: 'Preeklampsi', color: '#EAB308', bgColor: 'rgba(234,179,8,0.12)', description: 'Ağır preeklampsi veya eklampsi', severity: 4, icon: '🟡' },
    { id: 6, code: 'CODE_GREEN', name: 'Kod Yeşil', subtitle: 'Tahliye', color: '#22C55E', bgColor: 'rgba(34,197,94,0.12)', description: 'Acil tahliye gerekliliği (yangın, deprem vb.)', severity: 3, icon: '🟢' },
];

const MOCK_ALERTS = [
    { id: 1, code: CRISIS_CODES[2], triggeredBy: 'Dr. Mehmet Kaya', location: 'Doğumhane 2', patient: 'Merve Çelik', status: 'active', time: '3 dakika önce', ackCount: 1, totalTarget: 4 },
    { id: 2, code: CRISIS_CODES[3], triggeredBy: 'Hmş. Fatma Demir', location: 'Oda 201', patient: 'Elif Sarı', status: 'acknowledged', time: '1 saat önce', ackCount: 3, totalTarget: 4 },
    { id: 3, code: CRISIS_CODES[1], triggeredBy: 'Dr. Ayşe Yılmaz', location: 'Ameliyathane 1', patient: 'Ayça Koç', status: 'resolved', time: 'Dün 22:15', ackCount: 4, totalTarget: 4 },
    { id: 4, code: CRISIS_CODES[0], triggeredBy: 'Dr. Mehmet Kaya', location: 'Doğumhane 1', patient: null, status: 'resolved', time: 'Dün 14:30', ackCount: 5, totalTarget: 5 },
];

export default function CrisisPage() {
    const [activeTab, setActiveTab] = useState('trigger');
    const [showModal, setShowModal] = useState(false);
    const [selectedCode, setSelectedCode] = useState(null);
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [alerts, setAlerts] = useState(MOCK_ALERTS);
    const [toast, setToast] = useState(null);

    const handleTriggerAlarm = (code) => {
        setSelectedCode(code);
        setShowModal(true);
    };

    const confirmAlarm = () => {
        const newAlert = {
            id: Date.now(),
            code: selectedCode,
            triggeredBy: 'Siz',
            location: location || 'Belirtilmedi',
            patient: null,
            status: 'active',
            time: 'Şimdi',
            ackCount: 0,
            totalTarget: 4,
        };
        setAlerts([newAlert, ...alerts]);
        setShowModal(false);
        setLocation('');
        setNotes('');
        setToast({ type: 'warning', message: `${selectedCode.name} alarmı tetiklendi!` });
        setTimeout(() => setToast(null), 4000);
        setActiveTab('history');
    };

    const acknowledgeAlert = (alertId) => {
        setAlerts(alerts.map(a =>
            a.id === alertId ? { ...a, status: 'acknowledged', ackCount: a.ackCount + 1 } : a
        ));
        setToast({ type: 'success', message: 'Alarm onaylandı' });
        setTimeout(() => setToast(null), 3000);
    };

    const resolveAlert = (alertId) => {
        setAlerts(alerts.map(a =>
            a.id === alertId ? { ...a, status: 'resolved' } : a
        ));
        setToast({ type: 'success', message: 'Alarm çözüldü olarak işaretlendi' });
        setTimeout(() => setToast(null), 3000);
    };

    const getStatusLabel = (status) => {
        const labels = { active: 'Aktif', acknowledged: 'Onaylandı', resolved: 'Çözüldü', cancelled: 'İptal' };
        return labels[status] || status;
    };

    return (
        <div className="fade-in">
            {/* Toast */}
            {toast && (
                <div className="toast-container">
                    <div className={`toast ${toast.type}`}>
                        <span className="toast-icon">{toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                        <span className="toast-message">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'trigger' ? 'active' : ''}`} onClick={() => setActiveTab('trigger')}>
                    🚨 Alarm Tetikle
                </button>
                <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                    📋 Alarm Geçmişi
                </button>
            </div>

            {/* Alarm Tetikleme */}
            {activeTab === 'trigger' && (
                <>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
                        Acil durumlarda aşağıdaki kriz kodlarından birini seçerek alarm tetikleyebilirsiniz. İlgili tüm personele anlık bildirim gönderilecektir.
                    </p>
                    <div className="crisis-grid">
                        {CRISIS_CODES.map((code) => (
                            <div
                                key={code.id}
                                className="crisis-code-card"
                                onClick={() => handleTriggerAlarm(code)}
                                style={{
                                    background: code.bgColor,
                                    borderColor: code.color,
                                    color: code.color
                                }}
                            >
                                <div className="code-label">{code.icon} {code.code}</div>
                                <div className="code-name" style={{ color: 'var(--text-primary)' }}>{code.name}</div>
                                <div className="code-desc" style={{ color: 'var(--text-secondary)' }}>{code.description}</div>
                                <div className="code-severity">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <span key={i} className={`severity-dot ${i <= code.severity ? 'filled' : ''}`}></span>
                                    ))}
                                    <span style={{ fontSize: '11px', marginLeft: '4px', color: 'var(--text-muted)' }}>Seviye {code.severity}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Alarm Geçmişi */}
            {activeTab === 'history' && (
                <div className="data-section">
                    <div className="data-section-header">
                        <div className="data-section-title">Tüm Alarmlar</div>
                        <div className="data-section-actions">
                            <select className="filter-select" style={{ fontSize: '13px' }}>
                                <option>Tümü</option>
                                <option>Aktif</option>
                                <option>Onaylandı</option>
                                <option>Çözüldü</option>
                            </select>
                        </div>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Zaman</th>
                                <th>Kod</th>
                                <th>Konum</th>
                                <th>Tetikleyen</th>
                                <th>Hasta</th>
                                <th>Onay</th>
                                <th>Durum</th>
                                <th>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map((alert) => (
                                <tr key={alert.id}>
                                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{alert.time}</td>
                                    <td>
                                        <span style={{ color: alert.code.color, fontWeight: 600 }}>
                                            {alert.code.icon} {alert.code.name}
                                        </span>
                                    </td>
                                    <td>{alert.location}</td>
                                    <td>{alert.triggeredBy}</td>
                                    <td>{alert.patient || '-'}</td>
                                    <td>
                                        <span style={{ fontSize: '13px' }}>{alert.ackCount}/{alert.totalTarget}</span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${alert.status}`}>
                                            <span className="status-dot"></span>
                                            {getStatusLabel(alert.status)}
                                        </span>
                                    </td>
                                    <td>
                                        {alert.status === 'active' && (
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button className="btn btn-sm btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => acknowledgeAlert(alert.id)}>
                                                    Onayla
                                                </button>
                                                <button className="btn btn-sm btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => resolveAlert(alert.id)}>
                                                    Çöz
                                                </button>
                                            </div>
                                        )}
                                        {alert.status === 'acknowledged' && (
                                            <button className="btn btn-sm btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => resolveAlert(alert.id)}>
                                                Çözüldü
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Alarm Tetikleme Modalı */}
            {showModal && selectedCode && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedCode.icon} Alarm Tetikle</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{
                                padding: '16px',
                                background: selectedCode.bgColor,
                                borderRadius: 'var(--radius-sm)',
                                border: `1px solid ${selectedCode.color}30`,
                                marginBottom: '20px'
                            }}>
                                <div style={{ fontWeight: 700, color: selectedCode.color, fontSize: '18px' }}>{selectedCode.name}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{selectedCode.description}</div>
                            </div>

                            <div className="form-group">
                                <label>Konum / Oda</label>
                                <select className="filter-select" style={{ width: '100%' }} value={location} onChange={e => setLocation(e.target.value)}>
                                    <option value="">Seçiniz...</option>
                                    <option value="Ameliyathane 1">Ameliyathane 1 - Ana Salon</option>
                                    <option value="Ameliyathane 2">Ameliyathane 2 - Acil</option>
                                    <option value="Doğumhane 1">Doğumhane 1</option>
                                    <option value="Doğumhane 2">Doğumhane 2</option>
                                    <option value="Oda 201">Oda 201</option>
                                    <option value="Oda 202">Oda 202</option>
                                    <option value="Oda 203">Oda 203</option>
                                    <option value="Oda 204">Oda 204</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Notlar (Opsiyonel)</label>
                                <textarea
                                    rows={3}
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Ek bilgi giriniz..."
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px',
                                        fontFamily: 'Inter, sans-serif',
                                        resize: 'vertical',
                                    }}
                                ></textarea>
                            </div>

                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(239,68,68,0.08)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '13px',
                                color: 'var(--accent-red)',
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center'
                            }}>
                                ⚠️ Bu işlem tüm ilgili personele acil bildirim gönderecektir!
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                            <button className="btn btn-danger" onClick={confirmAlarm} style={{ background: selectedCode.color }}>
                                🚨 Alarmı Tetikle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
