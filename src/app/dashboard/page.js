'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const [data, setData] = useState(null);

    useEffect(() => {
        // Simüle dashboard verileri
        setData({
            activeAlerts: 2,
            todayOperations: 3,
            totalPatients: 4,
            occupancyRate: 75,
            avgResponseTime: '2.4 dk',
            dischargedToday: 1,
        });
    }, []);

    if (!data) {
        return <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }}></div></div>;
    }

    return (
        <div className="fade-in">
            {/* Kriz Banner */}
            <div className="crisis-banner">
                <div className="crisis-banner-icon">🚨</div>
                <div className="crisis-banner-content">
                    <div className="crisis-banner-title">Aktif Kriz Alarmı: Kod Kırmızı - Acil Sezaryen</div>
                    <div className="crisis-banner-detail">Doğumhane 2 • Tetikleyen: Dr. Mehmet Kaya • 3 dakika önce</div>
                </div>
                <div className="crisis-banner-actions">
                    <button className="btn btn-sm btn-danger">Onayla</button>
                    <button className="btn btn-sm btn-secondary">Detay</button>
                </div>
            </div>

            {/* İstatistik Kartları */}
            <div className="stats-grid">
                <div className="stat-card red">
                    <div className="stat-card-header">
                        <div className="stat-card-icon red">🚨</div>
                        <span className="stat-card-label">Aktif Alarmlar</span>
                    </div>
                    <div className="stat-card-value">{data.activeAlerts}</div>
                    <div className="stat-card-footer">
                        <span className="stat-card-trend down">↑ 1</span> son 24 saatte
                    </div>
                </div>

                <div className="stat-card blue">
                    <div className="stat-card-header">
                        <div className="stat-card-icon blue">🏥</div>
                        <span className="stat-card-label">Bugünkü Operasyonlar</span>
                    </div>
                    <div className="stat-card-value">{data.todayOperations}</div>
                    <div className="stat-card-footer">
                        1 tamamlandı, 2 planlandı
                    </div>
                </div>

                <div className="stat-card green">
                    <div className="stat-card-header">
                        <div className="stat-card-icon green">👶</div>
                        <span className="stat-card-label">Yatan Hastalar</span>
                    </div>
                    <div className="stat-card-value">{data.totalPatients}</div>
                    <div className="stat-card-footer">
                        <span className="stat-card-trend up">↑ 2</span> bu hafta
                    </div>
                </div>

                <div className="stat-card purple">
                    <div className="stat-card-header">
                        <div className="stat-card-icon purple">📊</div>
                        <span className="stat-card-label">Doluluk Oranı</span>
                    </div>
                    <div className="stat-card-value">{data.occupancyRate}%</div>
                    <div className="stat-card-footer">
                        12/16 yatak dolu
                    </div>
                </div>

                <div className="stat-card orange">
                    <div className="stat-card-header">
                        <div className="stat-card-icon orange">⏱️</div>
                        <span className="stat-card-label">Ort. Alarm Yanıt</span>
                    </div>
                    <div className="stat-card-value">{data.avgResponseTime}</div>
                    <div className="stat-card-footer">
                        Hedef: 3 dakika altı
                    </div>
                </div>

                <div className="stat-card green">
                    <div className="stat-card-header">
                        <div className="stat-card-icon green">✅</div>
                        <span className="stat-card-label">Bugün Taburcu</span>
                    </div>
                    <div className="stat-card-value">{data.dischargedToday}</div>
                    <div className="stat-card-footer">
                        Planlı: 2 hasta
                    </div>
                </div>
            </div>

            <div className="two-col-grid">
                {/* Bugünkü Operasyonlar */}
                <div className="data-section">
                    <div className="data-section-header">
                        <div className="data-section-title">📋 Bugünkü Operasyonlar</div>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Saat</th>
                                <th>Hasta</th>
                                <th>İşlem</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>09:00</td>
                                <td>Ayça Koç</td>
                                <td>Planlı Sezaryen</td>
                                <td><span className="status-badge scheduled"><span className="status-dot"></span>Planlandı</span></td>
                            </tr>
                            <tr>
                                <td>11:00</td>
                                <td>Merve Çelik</td>
                                <td>Normal Doğum Takibi</td>
                                <td><span className="status-badge in_progress"><span className="status-dot"></span>Devam Ediyor</span></td>
                            </tr>
                            <tr>
                                <td>14:30</td>
                                <td>Elif Sarı</td>
                                <td>Kontrol Muayenesi</td>
                                <td><span className="status-badge scheduled"><span className="status-dot"></span>Planlandı</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Son Alarmlar */}
                <div className="data-section">
                    <div className="data-section-header">
                        <div className="data-section-title">🔔 Son Kriz Alarmları</div>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Zaman</th>
                                <th>Kod</th>
                                <th>Konum</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>3 dk önce</td>
                                <td><span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>🔴 Kod Kırmızı</span></td>
                                <td>Doğumhane 2</td>
                                <td><span className="status-badge active"><span className="status-dot"></span>Aktif</span></td>
                            </tr>
                            <tr>
                                <td>1 saat önce</td>
                                <td><span style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>🟠 Kod Turuncu</span></td>
                                <td>Oda 201</td>
                                <td><span className="status-badge acknowledged"><span className="status-dot"></span>Onaylandı</span></td>
                            </tr>
                            <tr>
                                <td>Dün 22:15</td>
                                <td><span style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>🩷 Kod Pembe</span></td>
                                <td>Ameliyathane 1</td>
                                <td><span className="status-badge resolved"><span className="status-dot"></span>Çözüldü</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hasta Kanban Özeti */}
            <div className="data-section" style={{ marginTop: '8px' }}>
                <div className="data-section-header">
                    <div className="data-section-title">👶 Hasta Durum Özeti</div>
                </div>
                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    {[
                        { label: 'Yatış', count: 1, color: 'var(--accent-blue)', icon: '🏨' },
                        { label: 'Doğumda', count: 1, color: 'var(--accent-orange)', icon: '👶' },
                        { label: 'Ameliyatta', count: 1, color: 'var(--accent-purple)', icon: '🏥' },
                        { label: 'Postpartum', count: 1, color: 'var(--accent-green)', icon: '💚' },
                        { label: 'Taburcu', count: 0, color: 'var(--text-muted)', icon: '✅' },
                    ].map((item) => (
                        <div key={item.label} style={{
                            textAlign: 'center',
                            padding: '20px 16px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--border)',
                        }}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: item.color }}>{item.count}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
