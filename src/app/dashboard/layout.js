'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
    {
        section: 'Ana Menü',
        items: [
            { label: 'Gösterge Paneli', icon: '📊', href: '/dashboard' },
            { label: 'Kriz Alarmları', icon: '🚨', href: '/dashboard/crisis', badgeClass: 'badge-red', badgeKey: 'crisisCount' },
        ]
    },
    {
        section: 'Klinik Yönetimi',
        items: [
            { label: 'Ameliyathane Planı', icon: '🏥', href: '/dashboard/operations' },
            { label: 'Hasta Takibi', icon: '👶', href: '/dashboard/patients' },
        ]
    },
    {
        section: 'Analiz',
        items: [
            { label: 'Raporlar', icon: '📈', href: '/dashboard/reports' },
        ]
    },
    {
        section: 'Yönetim',
        items: [
            { label: 'Kullanıcılar', icon: '👥', href: '/dashboard/users', roles: ['admin', 'superadmin'] },
            { label: 'Ayarlar', icon: '⚙️', href: '/dashboard/settings', roles: ['admin', 'superadmin'] },
        ]
    },
];

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        // Kullanıcı bilgisini al
        fetchCurrentUser();
        // Tarih sadece client tarafında render edilsin (hydration fix)
        setCurrentDate(new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        } catch {
            // Middleware zaten yönlendirecek
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch {
            router.push('/login');
        }
    };

    const getRoleLabel = (role) => {
        const labels = {
            superadmin: 'Süper Admin',
            admin: 'Başhekim / Yönetici',
            doctor: 'Doktor',
            nurse: 'Hemşire',
            secretary: 'Sekreter',
        };
        return labels[role] || role;
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    const getPageTitle = () => {
        const titles = {
            '/dashboard': 'Gösterge Paneli',
            '/dashboard/crisis': 'Kriz Alarmları',
            '/dashboard/operations': 'Ameliyathane Planı',
            '/dashboard/patients': 'Hasta Takibi',
            '/dashboard/reports': 'Raporlar',
            '/dashboard/users': 'Kullanıcı Yönetimi',
            '/dashboard/settings': 'Ayarlar',
        };
        return titles[pathname] || 'Dashboard';
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="sidebar-brand-icon">🏥</div>
                        <div className="sidebar-brand-text">
                            <h2>KlinikKriz</h2>
                            <span>Operasyon Yönetimi</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((section) => (
                        <div key={section.section} className="sidebar-section">
                            <div className="sidebar-section-title">{section.section}</div>
                            {section.items.map((item) => {
                                // Rol kontrolü
                                if (item.roles && user && !item.roles.includes(user.role)) {
                                    return null;
                                }
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`sidebar-link ${isActive ? 'active' : ''}`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <span className="sidebar-link-icon">{item.icon}</span>
                                        {item.label}
                                        {item.badgeClass && (
                                            <span className={`sidebar-link-badge ${item.badgeClass}`}>2</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">
                            {user ? getInitials(user.name) : '?'}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name || 'Yükleniyor...'}</div>
                            <div className="sidebar-user-role">{user ? getRoleLabel(user.role) : ''}</div>
                        </div>
                        <button className="sidebar-logout" onClick={handleLogout} title="Çıkış Yap">
                            🚪
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="main-header">
                    <div className="main-header-left">
                        <button
                            className="btn-icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{ display: 'none' }}
                        >
                            ☰
                        </button>
                        <h1>{getPageTitle()}</h1>
                    </div>
                    <div className="main-header-right">
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {currentDate}
                        </span>
                    </div>
                </header>

                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
