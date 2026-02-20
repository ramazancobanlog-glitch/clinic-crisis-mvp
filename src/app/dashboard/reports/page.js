'use client';

import { useState } from 'react';

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState('week');

    const operationStats = [
        { label: 'Toplam Ameliyat', value: 24, trend: '+12%', color: 'blue' },
        { label: 'Sezaryen', value: 14, trend: '+8%', color: 'purple' },
        { label: 'Normal Doğum', value: 10, trend: '+18%', color: 'green' },
        { label: 'Ort. Süre', value: '48 dk', trend: '-5%', color: 'orange' },
    ];

    const crisisStats = [
        { label: 'Toplam Alarm', value: 8, trend: '+2', color: 'red' },
        { label: 'Ort. Yanıt Süresi', value: '2.4 dk', trend: '-0.3 dk', color: 'blue' },
        { label: 'Çözüm Oranı', value: '%100', trend: '', color: 'green' },
        { label: 'Onay Oranı', value: '%94', trend: '+2%', color: 'purple' },
    ];

    const weeklyOps = [
        { day: 'Pazartesi', sezaryen: 3, normal: 2 },
        { day: 'Salı', sezaryen: 2, normal: 1 },
        { day: 'Çarşamba', sezaryen: 1, normal: 3 },
        { day: 'Perşembe', sezaryen: 4, normal: 1 },
        { day: 'Cuma', sezaryen: 2, normal: 2 },
        { day: 'Cumartesi', sezaryen: 1, normal: 1 },
        { day: 'Pazar', sezaryen: 1, normal: 0 },
    ];

    const maxOps = Math.max(...weeklyOps.map(d => d.sezaryen + d.normal));

    const crisisByType = [
        { name: 'Kod Kırmızı - Acil Sezaryen', count: 3, color: '#EF4444' },
        { name: 'Kod Turuncu - PPH', count: 2, color: '#F97316' },
        { name: 'Kod Pembe - Yenidoğan', count: 1, color: '#EC4899' },
        { name: 'Kod Mavi - Kardiyak', count: 1, color: '#3B82F6' },
        { name: 'Kod Sarı - Preeklampsi', count: 1, color: '#EAB308' },
    ];

    const maxCrisis = Math.max(...crisisByType.map(c => c.count));

    const staffWorkload = [
        { name: 'Dr. Mehmet Kaya', operations: 12, hours: 36, alerts: 4 },
        { name: 'Dr. Ayşe Yılmaz', operations: 8, hours: 28, alerts: 2 },
        { name: 'Hmş. Fatma Demir', operations: 0, hours: 42, alerts: 5 },
        { name: 'Sek. Zeynep Ak', operations: 0, hours: 40, alerts: 1 },
    ];

    return (
        <div className="fade-in">
            {/* Tarih Filtresi */}
            <div className="filter-bar">
                <div className="tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
                    {[
                        { key: 'week', label: 'Bu Hafta' },
                        { key: 'month', label: 'Bu Ay' },
                        { key: 'quarter', label: 'Çeyrek' },
                    ].map(t => (
                        <button key={t.key} className={`tab ${dateRange === t.key ? 'active' : ''}`} onClick={() => setDateRange(t.key)}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
                    📄 PDF İndir
                </button>
                <button className="btn btn-secondary btn-sm">
                    📊 Excel İndir
                </button>
            </div>

            {/* Operasyon İstatistikleri */}
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>🏥 Operasyon İstatistikleri</h3>
            <div className="stats-grid">
                {operationStats.map(stat => (
                    <div key={stat.label} className={`stat-card ${stat.color}`}>
                        <div className="stat-card-header">
                            <span className="stat-card-label">{stat.label}</span>
                        </div>
                        <div className="stat-card-value">{stat.value}</div>
                        {stat.trend && <div className="stat-card-footer"><span className={`stat-card-trend ${stat.trend.startsWith('+') ? 'up' : 'down'}`}>{stat.trend}</span> geçen haftaya göre</div>}
                    </div>
                ))}
            </div>

            {/* Grafik Alanı */}
            <div className="two-col-grid">
                {/* Haftalık Operasyonlar */}
                <div className="chart-container">
                    <div className="chart-header">
                        <h4 className="chart-title">📊 Haftalık Operasyon Dağılımı</h4>
                    </div>
                    <div className="chart-placeholder">
                        {weeklyOps.map(day => (
                            <div key={day.day} className="chart-bar-group">
                                <div className="chart-bar-label">{day.day.slice(0, 3)}</div>
                                <div className="chart-bar-track">
                                    <div className="chart-bar-fill purple" style={{ width: `${((day.sezaryen + day.normal) / maxOps) * 100}%` }}>
                                        {day.sezaryen + day.normal}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Kriz Türleri */}
                <div className="chart-container">
                    <div className="chart-header">
                        <h4 className="chart-title">🚨 Kriz Alarm Türleri</h4>
                    </div>
                    <div className="chart-placeholder">
                        {crisisByType.map(crisis => (
                            <div key={crisis.name} className="chart-bar-group">
                                <div className="chart-bar-label" style={{ width: '140px', fontSize: '11px' }}>{crisis.name.split(' - ')[0]}</div>
                                <div className="chart-bar-track">
                                    <div className="chart-bar-fill" style={{ width: `${(crisis.count / maxCrisis) * 100}%`, background: crisis.color }}>
                                        {crisis.count}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Kriz Yanıt İstatistikleri */}
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '32px 0 16px' }}>🚨 Kriz Yanıt İstatistikleri</h3>
            <div className="stats-grid">
                {crisisStats.map(stat => (
                    <div key={stat.label} className={`stat-card ${stat.color}`}>
                        <div className="stat-card-header">
                            <span className="stat-card-label">{stat.label}</span>
                        </div>
                        <div className="stat-card-value">{stat.value}</div>
                        {stat.trend && <div className="stat-card-footer"><span className={`stat-card-trend up`}>{stat.trend}</span> geçen haftaya göre</div>}
                    </div>
                ))}
            </div>

            {/* Personel İş Yükü */}
            <div className="data-section" style={{ marginTop: '8px' }}>
                <div className="data-section-header">
                    <div className="data-section-title">👥 Personel İş Yükü</div>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Personel</th>
                            <th>Operasyon</th>
                            <th>Çalışma Saati</th>
                            <th>Alarm Yanıtı</th>
                            <th>İş Yükü</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffWorkload.map(staff => {
                            const load = (staff.hours / 45) * 100;
                            return (
                                <tr key={staff.name}>
                                    <td style={{ fontWeight: 600 }}>{staff.name}</td>
                                    <td>{staff.operations}</td>
                                    <td>{staff.hours} saat</td>
                                    <td>{staff.alerts}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(59,130,246,0.1)', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${Math.min(load, 100)}%`,
                                                    height: '100%',
                                                    borderRadius: '4px',
                                                    background: load > 90 ? 'var(--accent-red)' : load > 70 ? 'var(--accent-yellow)' : 'var(--accent-green)',
                                                    transition: 'width 1s ease-out'
                                                }}></div>
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: load > 90 ? 'var(--accent-red)' : 'var(--text-secondary)' }}>{Math.round(load)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
