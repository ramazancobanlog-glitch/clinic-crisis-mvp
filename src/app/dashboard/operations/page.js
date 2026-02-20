'use client';

import { useState } from 'react';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const ROOMS = [
    { id: 1, name: 'Ameliyathane 1', type: 'csection' },
    { id: 2, name: 'Ameliyathane 2', type: 'emergency' },
    { id: 3, name: 'Doğumhane 1', type: 'labor' },
    { id: 4, name: 'Doğumhane 2', type: 'labor' },
];

const MOCK_OPERATIONS = [
    { id: 1, roomId: 1, day: 0, startHour: 9, endHour: 11, type: 'csection', patient: 'Ayça Koç', doctor: 'Dr. Mehmet Kaya', operation: 'Planlı Sezaryen', status: 'scheduled', priority: 'high' },
    { id: 2, roomId: 3, day: 0, startHour: 8, endHour: 12, type: 'labor', patient: 'Merve Çelik', doctor: 'Dr. Mehmet Kaya', operation: 'Normal Doğum Takibi', status: 'in_progress', priority: 'normal' },
    { id: 3, roomId: 1, day: 1, startHour: 10, endHour: 12, type: 'csection', patient: 'Elif Sarı', doctor: 'Dr. Ayşe Yılmaz', operation: 'Planlı Sezaryen', status: 'scheduled', priority: 'normal' },
    { id: 4, roomId: 2, day: 2, startHour: 14, endHour: 16, type: 'emergency', patient: '-', doctor: 'Dr. Mehmet Kaya', operation: 'Acil Slot (Rezerve)', status: 'scheduled', priority: 'emergency' },
    { id: 5, roomId: 4, day: 3, startHour: 9, endHour: 13, type: 'labor', patient: 'Yeni Hasta', doctor: 'Dr. Ayşe Yılmaz', operation: 'Doğum Takibi', status: 'scheduled', priority: 'normal' },
];

const DOCTORS = ['Dr. Mehmet Kaya', 'Dr. Ayşe Yılmaz'];

export default function OperationsPage() {
    const [activeTab, setActiveTab] = useState('calendar');
    const [selectedRoom, setSelectedRoom] = useState('all');
    const [operations, setOperations] = useState(MOCK_OPERATIONS);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [newOp, setNewOp] = useState({
        roomId: 1, day: 0, startHour: 9, endHour: 10,
        patient: '', doctor: DOCTORS[0], operation: '', priority: 'normal', type: 'general'
    });

    const filteredOps = selectedRoom === 'all' ? operations : operations.filter(op => op.roomId === parseInt(selectedRoom));

    const getStatusLabel = (s) => ({ scheduled: 'Planlandı', in_progress: 'Devam Ediyor', completed: 'Tamamlandı', cancelled: 'İptal' }[s] || s);

    const handleCreateOperation = () => {
        if (!newOp.patient || !newOp.operation) {
            setToast({ type: 'error', message: 'Lütfen hasta ve işlem bilgisi giriniz' });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        // Çakışma kontrolü
        const conflict = operations.find(op =>
            op.roomId === newOp.roomId &&
            op.day === newOp.day &&
            ((newOp.startHour >= op.startHour && newOp.startHour < op.endHour) ||
                (newOp.endHour > op.startHour && newOp.endHour <= op.endHour))
        );

        if (conflict) {
            setToast({ type: 'error', message: `Çakışma tespit edildi! ${ROOMS.find(r => r.id === newOp.roomId)?.name} odası bu saatte meşgul.` });
            setTimeout(() => setToast(null), 4000);
            return;
        }

        setOperations([...operations, { ...newOp, id: Date.now(), status: 'scheduled' }]);
        setShowModal(false);
        setNewOp({ roomId: 1, day: 0, startHour: 9, endHour: 10, patient: '', doctor: DOCTORS[0], operation: '', priority: 'normal', type: 'general' });
        setToast({ type: 'success', message: 'Operasyon başarıyla oluşturuldu' });
        setTimeout(() => setToast(null), 3000);
    };

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
                            <>
                                <div key={`time-${hour}`} className="calendar-time-cell">{hour}</div>
                                {DAYS.map((_, dayIdx) => {
                                    const cellOps = filteredOps.filter(op => op.day === dayIdx && op.startHour === (hourIdx + 8));
                                    return (
                                        <div key={`${dayIdx}-${hourIdx}`} className="calendar-cell">
                                            {cellOps.map(op => (
                                                <div key={op.id} className={`calendar-event ${op.type}`} title={`${op.operation} - ${op.patient}`}>
                                                    <div>{op.patient}</div>
                                                    <div style={{ fontSize: '10px', opacity: 0.7 }}>{op.operation}</div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </>
                        ))}
                    </div>
                </div>
            )}

            {/* Liste */}
            {activeTab === 'list' && (
                <div className="data-section">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Gün</th>
                                <th>Saat</th>
                                <th>Oda</th>
                                <th>Hasta</th>
                                <th>İşlem</th>
                                <th>Doktor</th>
                                <th>Öncelik</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOps.map(op => (
                                <tr key={op.id}>
                                    <td>{DAYS[op.day]}</td>
                                    <td>{HOURS[op.startHour - 8]} - {HOURS[op.endHour - 8] || '18:00'}</td>
                                    <td>{ROOMS.find(r => r.id === op.roomId)?.name}</td>
                                    <td style={{ fontWeight: 600 }}>{op.patient}</td>
                                    <td>{op.operation}</td>
                                    <td>{op.doctor}</td>
                                    <td><span className={`status-badge ${op.priority}`}>{op.priority === 'emergency' ? 'Acil' : op.priority === 'high' ? 'Yüksek' : 'Normal'}</span></td>
                                    <td><span className={`status-badge ${op.status}`}><span className="status-dot"></span>{getStatusLabel(op.status)}</span></td>
                                </tr>
                            ))}
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
                                    <label>Gün</label>
                                    <select className="filter-select" style={{ width: '100%' }} value={newOp.day} onChange={e => setNewOp({ ...newOp, day: parseInt(e.target.value) })}>
                                        {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                    </select>
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
                                    <select className="filter-select" style={{ width: '100%' }} value={newOp.startHour} onChange={e => setNewOp({ ...newOp, startHour: parseInt(e.target.value) })}>
                                        {HOURS.map((h, i) => <option key={i} value={i + 8}>{h}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Bitiş Saati</label>
                                    <select className="filter-select" style={{ width: '100%' }} value={newOp.endHour} onChange={e => setNewOp({ ...newOp, endHour: parseInt(e.target.value) })}>
                                        {HOURS.map((h, i) => <option key={i} value={i + 8}>{h}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Hasta Adı</label>
                                <input type="text" value={newOp.patient} onChange={e => setNewOp({ ...newOp, patient: e.target.value })} placeholder="Hasta adı soyadı" />
                            </div>
                            <div className="form-group">
                                <label>İşlem</label>
                                <input type="text" value={newOp.operation} onChange={e => setNewOp({ ...newOp, operation: e.target.value })} placeholder="Operasyon açıklaması" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>Doktor</label>
                                    <select className="filter-select" style={{ width: '100%' }} value={newOp.doctor} onChange={e => setNewOp({ ...newOp, doctor: e.target.value })}>
                                        {DOCTORS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Öncelik</label>
                                    <select className="filter-select" style={{ width: '100%' }} value={newOp.priority} onChange={e => setNewOp({ ...newOp, priority: e.target.value })}>
                                        <option value="normal">Normal</option>
                                        <option value="high">Yüksek</option>
                                        <option value="emergency">Acil</option>
                                    </select>
                                </div>
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
