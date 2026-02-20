'use client';

import { useState } from 'react';

const ROLE_LABELS = {
    superadmin: 'Süper Admin',
    admin: 'Başhekim / Yönetici',
    doctor: 'Doktor',
    nurse: 'Hemşire',
    secretary: 'Sekreter',
};

const MOCK_USERS = [
    { id: 1, name: 'Dr. Ayşe Yılmaz', email: 'admin@klinik.com', role: 'admin', department: 'Yönetim', phone: '0532 100 0001', isActive: true, lastLogin: '20 Şubat 2026, 10:30' },
    { id: 2, name: 'Dr. Mehmet Kaya', email: 'doktor@klinik.com', role: 'doctor', department: 'Kadın Doğum', phone: '0532 100 0002', isActive: true, lastLogin: '20 Şubat 2026, 08:15' },
    { id: 3, name: 'Hmş. Fatma Demir', email: 'hemsire@klinik.com', role: 'nurse', department: 'Doğumhane', phone: '0532 100 0003', isActive: true, lastLogin: '19 Şubat 2026, 22:45' },
    { id: 4, name: 'Sek. Zeynep Ak', email: 'sekreter@klinik.com', role: 'secretary', department: 'Resepsiyon', phone: '0532 100 0004', isActive: true, lastLogin: '20 Şubat 2026, 09:00' },
];

export default function UsersPage() {
    const [users, setUsers] = useState(MOCK_USERS);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'nurse', department: '', phone: '' });

    const filteredUsers = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchRole = filterRole === 'all' || u.role === filterRole;
        return matchSearch && matchRole;
    });

    const handleAddUser = () => {
        if (!newUser.name || !newUser.email) {
            setToast({ type: 'error', message: 'Ad ve e-posta zorunludur' });
            setTimeout(() => setToast(null), 3000);
            return;
        }
        setUsers([...users, { ...newUser, id: Date.now(), isActive: true, lastLogin: '-' }]);
        setShowModal(false);
        setNewUser({ name: '', email: '', role: 'nurse', department: '', phone: '' });
        setToast({ type: 'success', message: 'Kullanıcı başarıyla oluşturuldu' });
        setTimeout(() => setToast(null), 3000);
    };

    const toggleUserStatus = (userId) => {
        setUsers(users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
        const user = users.find(u => u.id === userId);
        setToast({ type: 'success', message: `${user.name} ${user.isActive ? 'devre dışı bırakıldı' : 'aktif edildi'}` });
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

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-card-header"><span className="stat-card-label">Toplam Kullanıcı</span></div>
                    <div className="stat-card-value">{users.length}</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-card-header"><span className="stat-card-label">Aktif</span></div>
                    <div className="stat-card-value">{users.filter(u => u.isActive).length}</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-card-header"><span className="stat-card-label">Doktor</span></div>
                    <div className="stat-card-value">{users.filter(u => u.role === 'doctor' || u.role === 'admin').length}</div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-card-header"><span className="stat-card-label">Hemşire</span></div>
                    <div className="stat-card-value">{users.filter(u => u.role === 'nurse').length}</div>
                </div>
            </div>

            {/* Filter */}
            <div className="filter-bar">
                <div className="filter-search-wrapper">
                    <span className="filter-search-icon">🔍</span>
                    <input type="text" className="filter-search" placeholder="Kullanıcı ara..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <select className="filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                    <option value="all">Tüm Roller</option>
                    {Object.entries(ROLE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>➕ Yeni Kullanıcı</button>
            </div>

            {/* Users Table */}
            <div className="data-section">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Kullanıcı</th>
                            <th>E-posta</th>
                            <th>Rol</th>
                            <th>Departman</th>
                            <th>Son Giriş</th>
                            <th>Durum</th>
                            <th>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '8px',
                                            background: user.role === 'admin' ? 'var(--gradient-blue)' : user.role === 'doctor' ? 'var(--gradient-purple)' : user.role === 'nurse' ? 'var(--gradient-green)' : 'var(--gradient-red)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '12px', fontWeight: 700, flexShrink: 0
                                        }}>
                                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{user.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.phone}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontSize: '13px' }}>{user.email}</td>
                                <td><span className="status-badge active">{ROLE_LABELS[user.role]}</span></td>
                                <td>{user.department}</td>
                                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.lastLogin}</td>
                                <td>
                                    <span className={`status-badge ${user.isActive ? 'completed' : 'cancelled'}`}>
                                        <span className="status-dot"></span>
                                        {user.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-secondary" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={() => toggleUserStatus(user.id)}>
                                        {user.isActive ? 'Devre Dışı' : 'Aktif Et'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>➕ Yeni Kullanıcı</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Ad Soyad *</label>
                                <input type="text" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="Dr. ..." />
                            </div>
                            <div className="form-group">
                                <label>E-posta *</label>
                                <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="ornek@klinik.com" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>Rol</label>
                                    <select className="filter-select" style={{ width: '100%' }} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                        {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Departman</label>
                                    <input type="text" value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} placeholder="Kadın Doğum" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Telefon</label>
                                <input type="text" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} placeholder="0532 ..." />
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--accent-yellow)' }}>
                                ⚠️ Kullanıcıya e-posta ile şifre oluşturma bağlantısı gönderilecektir.
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                            <button className="btn btn-primary" onClick={handleAddUser}>Kullanıcı Oluştur</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
