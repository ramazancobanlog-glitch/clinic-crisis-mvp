'use client';

import { useState } from 'react';

const STATUS_LABELS = {
    admitted: 'Yatış',
    in_labor: 'Doğumda',
    in_surgery: 'Ameliyatta',
    postpartum: 'Postpartum',
    discharged: 'Taburcu',
};

const RISK_LABELS = { low: 'Düşük', medium: 'Orta', high: 'Yüksek', critical: 'Kritik' };

const MOCK_PATIENTS = [
    { id: 1, name: 'Elif Sarı', tc: '123***901', birthDate: '1992-05-15', phone: '0532 200 ****', bloodType: 'A Rh+', gestationalWeek: 38, riskLevel: 'low', status: 'admitted', room: '201', bed: 'A', emergencyContact: 'Ahmet Sarı', notes: 'Normal gebelik takibi', admissionDate: '2026-02-18' },
    { id: 2, name: 'Merve Çelik', tc: '234***012', birthDate: '1988-11-22', phone: '0532 200 ****', bloodType: 'B Rh+', gestationalWeek: 36, riskLevel: 'high', status: 'in_labor', room: '202', bed: 'B', emergencyContact: 'Can Çelik', notes: 'Gestasyonel diyabet mevcut', admissionDate: '2026-02-19' },
    { id: 3, name: 'Ayça Koç', tc: '345***123', birthDate: '1995-03-08', phone: '0532 200 ****', bloodType: '0 Rh-', gestationalWeek: 40, riskLevel: 'medium', status: 'in_surgery', room: '203', bed: 'A', emergencyContact: 'Burak Koç', notes: 'Planlı sezaryen - çoğul gebelik', admissionDate: '2026-02-19' },
    { id: 4, name: 'Deniz Aydın', tc: '456***234', birthDate: '1990-07-30', phone: '0532 200 ****', bloodType: 'AB Rh+', gestationalWeek: 39, riskLevel: 'low', status: 'postpartum', room: '204', bed: 'B', emergencyContact: 'Emre Aydın', notes: 'Normal doğum gerçekleşti', admissionDate: '2026-02-17' },
];

const EVENTS = [
    { id: 1, patientId: 1, type: 'admission', title: 'Yatış Kabul', description: 'Hasta yatışı yapıldı', by: 'Sek. Zeynep Ak', time: '18 Şubat 10:00' },
    { id: 2, patientId: 1, type: 'examination', title: 'İlk Muayene', description: 'NST ve USG yapıldı, normal bulgular', by: 'Dr. Mehmet Kaya', time: '18 Şubat 11:30' },
    { id: 3, patientId: 2, type: 'admission', title: 'Yatış Kabul', description: 'Acil başvuru - düzensiz kasılmalar', by: 'Sek. Zeynep Ak', time: '19 Şubat 03:00' },
    { id: 4, patientId: 2, type: 'lab_result', title: 'Kan Tahlili', description: 'Kan şekeri seviyesi yüksek, insülin dozu ayarlandı', by: 'Hmş. Fatma Demir', time: '19 Şubat 04:00' },
    { id: 5, patientId: 3, type: 'surgery_prep', title: 'Ameliyat Hazırlığı', description: 'Anestezi konsültasyonu tamamlandı', by: 'Dr. Ayşe Yılmaz', time: '19 Şubat 08:00' },
    { id: 6, patientId: 4, type: 'surgery', title: 'Normal Doğum', description: 'Komplikasyonsuz vajinal doğum, 3200gr erkek bebek', by: 'Dr. Mehmet Kaya', time: '17 Şubat 15:30' },
    { id: 7, patientId: 4, type: 'note', title: 'Postpartum Takip', description: 'Anne ve bebek stabil, emzirme eğitimi verildi', by: 'Hmş. Fatma Demir', time: '18 Şubat 09:00' },
];

export default function PatientsPage() {
    const [viewMode, setViewMode] = useState('kanban');
    const [patients, setPatients] = useState(MOCK_PATIENTS);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [newPatient, setNewPatient] = useState({
        name: '', bloodType: 'A Rh+', gestationalWeek: 38, riskLevel: 'low', status: 'admitted', room: '', bed: '', notes: ''
    });

    const filteredPatients = patients.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const kanbanColumns = ['admitted', 'in_labor', 'in_surgery', 'postpartum', 'discharged'];

    const updatePatientStatus = (patientId, newStatus) => {
        setPatients(patients.map(p => p.id === patientId ? { ...p, status: newStatus } : p));
        setToast({ type: 'success', message: `Hasta durumu güncellendi: ${STATUS_LABELS[newStatus]}` });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAddPatient = () => {
        if (!newPatient.name) {
            setToast({ type: 'error', message: 'Hasta adı zorunludur' });
            setTimeout(() => setToast(null), 3000);
            return;
        }
        setPatients([...patients, { ...newPatient, id: Date.now(), tc: '***', phone: '***', birthDate: '-', emergencyContact: '-', admissionDate: new Date().toISOString().split('T')[0] }]);
        setShowAddModal(false);
        setNewPatient({ name: '', bloodType: 'A Rh+', gestationalWeek: 38, riskLevel: 'low', status: 'admitted', room: '', bed: '', notes: '' });
        setToast({ type: 'success', message: 'Hasta kaydı oluşturuldu' });
        setTimeout(() => setToast(null), 3000);
    };

    const getEventIcon = (type) => {
        const icons = { admission: '🏨', examination: '🩺', lab_result: '🧪', ultrasound: '📷', medication: '💊', surgery_prep: '⚙️', surgery: '🏥', postop: '💚', discharge: '✅', note: '📝' };
        return icons[type] || '📋';
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
                <div className="filter-search-wrapper">
                    <span className="filter-search-icon">🔍</span>
                    <input type="text" className="filter-search" placeholder="Hasta ara..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">Tüm Durumlar</option>
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
                <button className={`tab ${viewMode === 'kanban' ? 'active' : ''}`} onClick={() => setViewMode('kanban')} style={{ borderBottom: 'none', padding: '8px 12px', fontSize: '13px' }}>📊 Kanban</button>
                <button className={`tab ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} style={{ borderBottom: 'none', padding: '8px 12px', fontSize: '13px' }}>📋 Liste</button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>➕ Yeni Hasta</button>
            </div>

            {/* Kanban Board */}
            {viewMode === 'kanban' && (
                <div className="kanban-board">
                    {kanbanColumns.map(status => {
                        const columnPatients = filteredPatients.filter(p => p.status === status);
                        const columnColors = {
                            admitted: 'var(--accent-blue)', in_labor: 'var(--accent-orange)',
                            in_surgery: 'var(--accent-purple)', postpartum: 'var(--accent-green)',
                            discharged: 'var(--text-muted)'
                        };
                        return (
                            <div key={status} className="kanban-column">
                                <div className="kanban-column-header">
                                    <div className="kanban-column-title">
                                        <span style={{ color: columnColors[status] }}>●</span>
                                        {STATUS_LABELS[status]}
                                    </div>
                                    <span className="kanban-column-count">{columnPatients.length}</span>
                                </div>
                                <div className="kanban-column-body">
                                    {columnPatients.map(patient => (
                                        <div key={patient.id} className="kanban-card" onClick={() => setSelectedPatient(patient)}>
                                            <div className="kanban-card-name">{patient.name}</div>
                                            <div className="kanban-card-info">
                                                🩸 {patient.bloodType} • {patient.gestationalWeek}. hafta
                                            </div>
                                            <div className="kanban-card-info">
                                                🚪 Oda {patient.room} / Yatak {patient.bed}
                                            </div>
                                            <div className="kanban-card-meta">
                                                <span className={`kanban-card-risk status-badge ${patient.riskLevel}`}>
                                                    {RISK_LABELS[patient.riskLevel]} Risk
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {columnPatients.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                            Hasta yok
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Liste Görünümü */}
            {viewMode === 'list' && (
                <div className="data-section">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Hasta</th>
                                <th>Kan Grubu</th>
                                <th>Hafta</th>
                                <th>Oda / Yatak</th>
                                <th>Risk</th>
                                <th>Durum</th>
                                <th>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.map(patient => (
                                <tr key={patient.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedPatient(patient)}>
                                    <td style={{ fontWeight: 600 }}>{patient.name}</td>
                                    <td>{patient.bloodType}</td>
                                    <td>{patient.gestationalWeek}</td>
                                    <td>{patient.room} / {patient.bed}</td>
                                    <td><span className={`status-badge ${patient.riskLevel}`}>{RISK_LABELS[patient.riskLevel]}</span></td>
                                    <td><span className={`status-badge ${patient.status}`}><span className="status-dot"></span>{STATUS_LABELS[patient.status]}</span></td>
                                    <td>
                                        <select className="filter-select" style={{ fontSize: '12px', padding: '4px 8px' }}
                                            value={patient.status} onClick={e => e.stopPropagation()}
                                            onChange={e => updatePatientStatus(patient.id, e.target.value)}>
                                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Hasta Detay Modal */}
            {selectedPatient && (
                <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
                        <div className="modal-header">
                            <h3>👤 {selectedPatient.name}</h3>
                            <button className="modal-close" onClick={() => setSelectedPatient(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {/* Hasta Bilgileri */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                {[
                                    { label: 'TC Kimlik', value: selectedPatient.tc },
                                    { label: 'Kan Grubu', value: selectedPatient.bloodType },
                                    { label: 'Gebelik Haftası', value: `${selectedPatient.gestationalWeek}. hafta` },
                                    { label: 'Risk Seviyesi', value: RISK_LABELS[selectedPatient.riskLevel] },
                                    { label: 'Oda / Yatak', value: `${selectedPatient.room} / ${selectedPatient.bed}` },
                                    { label: 'Yatış Tarihi', value: selectedPatient.admissionDate },
                                    { label: 'Acil İletişim', value: selectedPatient.emergencyContact },
                                    { label: 'Durum', value: STATUS_LABELS[selectedPatient.status] },
                                ].map(item => (
                                    <div key={item.label}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{item.label}</div>
                                        <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Notlar */}
                            {selectedPatient.notes && (
                                <div style={{ padding: '12px 16px', background: 'rgba(59,130,246,0.06)', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '13px', border: '1px solid rgba(59,130,246,0.15)' }}>
                                    📋 {selectedPatient.notes}
                                </div>
                            )}

                            {/* Süreç Geçmişi */}
                            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>📜 Süreç Geçmişi</h4>
                            <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '20px', marginLeft: '8px' }}>
                                {EVENTS.filter(e => e.patientId === selectedPatient.id).map(event => (
                                    <div key={event.id} style={{ marginBottom: '16px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '-28px', top: '2px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--bg-card)', border: '2px solid var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}></div>
                                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{getEventIcon(event.type)} {event.title}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{event.description}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{event.by} • {event.time}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Durum Güncelle */}
                            <div style={{ display: 'flex', gap: '6px', marginTop: '20px', flexWrap: 'wrap' }}>
                                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                    <button key={key} className={`btn btn-sm ${selectedPatient.status === key ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{ fontSize: '12px', padding: '6px 12px' }}
                                        onClick={() => { updatePatientStatus(selectedPatient.id, key); setSelectedPatient({ ...selectedPatient, status: key }); }}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Yeni Hasta Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>➕ Yeni Hasta Kaydı</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Hasta Adı Soyadı *</label>
                                <input type="text" value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} placeholder="Ad Soyad" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>Kan Grubu</label>
                                    <select className="filter-select" style={{ width: '100%' }} value={newPatient.bloodType} onChange={e => setNewPatient({ ...newPatient, bloodType: e.target.value })}>
                                        {['A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', 'AB Rh+', 'AB Rh-', '0 Rh+', '0 Rh-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Gebelik Haftası</label>
                                    <input type="number" value={newPatient.gestationalWeek} onChange={e => setNewPatient({ ...newPatient, gestationalWeek: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>Risk Seviyesi</label>
                                    <select className="filter-select" style={{ width: '100%' }} value={newPatient.riskLevel} onChange={e => setNewPatient({ ...newPatient, riskLevel: e.target.value })}>
                                        {Object.entries(RISK_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Oda / Yatak</label>
                                    <input type="text" value={newPatient.room} onChange={e => setNewPatient({ ...newPatient, room: e.target.value })} placeholder="Ör: 205/A" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Notlar</label>
                                <textarea rows={2} value={newPatient.notes} onChange={e => setNewPatient({ ...newPatient, notes: e.target.value })} placeholder="Ek bilgiler..." style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'Inter, sans-serif', resize: 'vertical' }}></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>İptal</button>
                            <button className="btn btn-primary" onClick={handleAddPatient}>Hasta Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
