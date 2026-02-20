'use client';

import React, { useState, useEffect } from 'react';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const ROOMS = [
    { id: 1, name: 'Ameliyathane 1', type: 'csection' },
    { id: 2, name: 'Ameliyathane 2', type: 'emergency' },
    { id: 3, name: 'Doğumhane 1', type: 'labor' },
    { id: 4, name: 'Doğumhane 2', type: 'labor' },
];

export default function OperationsPage() {
    const [activeTab, setActiveTab] = useState('calendar');
    const [selectedRoom, setSelectedRoom] = useState('all');
    const [operations, setOperations] = useState([]);
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [newOp, setNewOp] = useState({
        roomId: 1, patientId: '', doctorId: 1, type: 'csection',
        date: new Date().toISOString().split('T')[0],
        startHour: '09:00', endHour: '10:00', notes: '', priority: 'normal'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [opsRes, patientsRes] = await Promise.all([
                fetch('/api/operations'),
                fetch('/api/patients')
            ]);

            if (opsRes.ok) setOperations(await opsRes.json());
            if (patientsRes.ok) setPatients(await patientsRes.json());
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateOperation = async () => {
        if (!newOp.patientId || !newOp.date) {
            setToast({ type: 'error', message: 'Lütfen hasta ve tarih seçiniz' });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        const startTime = `${newOp.date}T${newOp.startHour}:00`;
        const endTime = `${newOp.date}T${newOp.endHour}:00`;

        try {
            const res = await fetch('/api/operations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: newOp.roomId,
                    patientId: newOp.patientId,
                    doctorId: newOp.doctorId,
                    type: newOp.type,
                    startTime,
                    endTime,
                    notes: newOp.notes
                })
            });

            if (res.ok) {
                setShowModal(false);
                setToast({ type: 'success', message: 'Operasyon başarıyla oluşturuldu' });
                fetchData();
            } else {
                const data = await res.json();
                setToast({ type: 'error', message: data.error || 'Çakışma veya hata oluştu' });
            }
        } catch (error) {
            setToast({ type: 'error', message: 'Bağlantı hatası' });
        }
        setTimeout(() => setToast(null), 3000);
    };

    const filteredOps = selectedRoom === 'all' ? operations : operations.filter(op => op.room_id === parseInt(selectedRoom));
    const getStatusLabel = (s) => ({ scheduled: 'Planlandı', in_progress: 'Devam Ediyor', completed: 'Tamamlandı', cancelled: 'İptal' }[s] || s);


    return (
        <div className="fade-in">
            {toast && (
                <div className="toast-container">
                    <div className={`toast ${toast.type}`}>
                        <span className="toast-icon">{toast.type === 'success' ? '✅' : '❌'}</span>
                        <span className="toast-message">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            <div className="filter-bar">
                <select className="filter-select" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>
                    <option value="all">Tüm Odalar</option>
                    {ROOMS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                    ➕ Yeni Operasyon
                </button>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
                    📅 Takvim Görünümü
                </button>
                <button className={`tab ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
                    📋 Liste Görünümü
                </button>
            </div>

            {/* Takvim */}
            {activeTab === 'calendar' && (
                <div style={{ overflowX: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', minWidth: '800px' }}>
                        {/* Header */}
                        <div className="calendar-header-cell">Saat</div>
                        {DAYS.map(day => <div key={day} className="calendar-header-cell">{day}</div>)}

                        {/* Rows */}
                        {HOURS.map((hour, hourIdx) => (
                            <React.Fragment key={hour}>
                                <div className="calendar-time-cell">{hour}</div>
                                {DAYS.map((_, dayIdx) => {
                                    // Not: Takvim görünümü için tarihi bugünkü haftaya eşlemek gerekir
                                    // Şimdilik listeyi gösteriyoruz, takvim gridi için startTime parse edilecek
                                    return (
                                        <div key={dayIdx} className="calendar-cell"></div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
                        * Takvim görünümü geliştirme aşamasındadır. Lütfen Liste Görünümünü kullanın.
                    </p>
                </div>
            )}

            {/* Liste */}
            {activeTab === 'list' && (
                <div className="data-section">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tarih</th>
                                <th>Saat</th>
                                <th>Oda</th>
                                <th>Hasta</th>
                                <th>İşlem</th>
                                <th>Doktor</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOps.map(op => (
                                <tr key={op.id}>
                                    <td>{new Date(op.start_time).toLocaleDateString('tr-TR')}</td>
                                    <td>{new Date(op.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - {new Date(op.end_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>{ROOMS.find(r => r.id === op.room_id)?.name}</td>
                                    <td style={{ fontWeight: 600 }}>{op.patient_name}</td>
                                    <td>{op.type === 'csection' ? 'Sezaryen' : op.type === 'labor' ? 'Doğum' : op.type}</td>
                                    <td>{op.doctor_name}</td>
                                    <td><span className={`status-badge ${op.status}`}><span className="status-dot"></span>{getStatusLabel(op.status)}</span></td>
                                </tr>
                            ))}
                            {filteredOps.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                        Operasyon bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Oda Durumu */}
            <div className="stats-grid" style={{ marginTop: '24px' }}>
                {ROOMS.map(room => {
                    const roomOps = operations.filter(op => op.roomId === room.id && op.status !== 'cancelled');
                    const activeOp = roomOps.find(op => op.status === 'in_progress');
                    return (
                        <div key={room.id} className={`stat-card ${activeOp ? 'purple' : 'blue'}`}>
                            <div className="stat-card-header">
                                <div className={`stat-card-icon ${activeOp ? 'purple' : 'blue'}`}>
                                    {room.type === 'csection' ? '🏥' : room.type === 'emergency' ? '🚑' : '👶'}
                                </div>
                                <span className="stat-card-label">{room.name}</span>
                            </div>
                            <div className="stat-card-value" style={{ fontSize: '16px' }}>
                                {activeOp ? (
                                    <span style={{ color: 'var(--accent-purple)' }}>Ameliyatta: {activeOp.patient}</span>
                                ) : (
                                    <span style={{ color: 'var(--accent-green)' }}>Müsait</span>
                                )}
                            </div>
                            <div className="stat-card-footer">
                                Bu hafta {roomOps.length} operasyon planlandı
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Yeni Operasyon Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>➕ Yeni Operasyon Oluştur</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Ameliyathane / Oda</label>
                                <select className="filter-select" style={{ width: '100%' }} value={newOp.roomId} onChange={e => setNewOp({ ...newOp, roomId: parseInt(e.target.value) })}>
                                    {ROOMS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>Tarih</label>
                                    <input type="date" className="filter-select" style={{ width: '100%' }} value={newOp.date} onChange={e => setNewOp({ ...newOp, date: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>İşlem Türü</label>
                                    <select className="filter-select" style={{ width: '100%' }} value={newOp.type} onChange={e => setNewOp({ ...newOp, type: e.target.value })}>
                                        <option value="csection">Sezaryen</option>
                                        <option value="labor">Normal Doğum</option>
                                        <option value="emergency">Acil</option>
                                        <option value="general">Genel</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>Başlangıç Saati</label>
                                    <select className="filter-select" style={{ width: '100%' }} value={newOp.startHour} onChange={e => setNewOp({ ...newOp, startHour: e.target.value })}>
                                        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Bitiş Saati</label>
                                    <select className="filter-select" style={{ width: '100%' }} value={newOp.endHour} onChange={e => setNewOp({ ...newOp, endHour: e.target.value })}>
                                        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Hasta Seçiniz</label>
                                <select className="filter-select" style={{ width: '100%' }} value={newOp.patientId} onChange={e => setNewOp({ ...newOp, patientId: e.target.value })}>
                                    <option value="">Seçiniz...</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Doktor</label>
                                <select className="filter-select" style={{ width: '100%' }} value={newOp.doctorId} onChange={e => setNewOp({ ...newOp, doctorId: parseInt(e.target.value) })}>
                                    <option value="1">Dr. Ayşe Yılmaz (Demo)</option>
                                    <option value="2">Dr. Mehmet Kaya (Demo)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Notlar</label>
                                <textarea rows={2} value={newOp.notes} onChange={e => setNewOp({ ...newOp, notes: e.target.value })} placeholder="Ek bilgiler..." style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'Inter, sans-serif', resize: 'vertical' }}></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                            <button className="btn btn-primary" onClick={handleCreateOperation}>Operasyon Oluştur</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
