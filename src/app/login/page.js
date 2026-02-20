'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Giriş başarısız');
                setLoading(false);
                return;
            }

            router.push('/dashboard');
        } catch {
            setError('Sunucu bağlantı hatası');
            setLoading(false);
        }
    };

    const fillDemo = (demoEmail) => {
        setEmail(demoEmail);
        setPassword('admin123');
        setError('');
    };

    return (
        <div className="login-page">
            <div className="login-container fade-in">
                <div className="login-logo">
                    <div className="login-logo-icon">🏥</div>
                    <h1>KlinikKriz</h1>
                    <p>Doğum Kliniği Kriz & Operasyon Yönetimi</p>
                </div>

                <div className="login-card">
                    <h2>Giriş Yap</h2>
                    <p className="subtitle">Devam etmek için hesabınıza giriş yapın</p>

                    {error && (
                        <div className="form-error">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="email">E-posta Adresi</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ornek@klinik.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Şifre</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <><span className="spinner"></span> Giriş yapılıyor...</> : '🔐 Giriş Yap'}
                        </button>
                    </form>

                    <div className="demo-accounts">
                        <p>🧪 Demo Hesapları (Geliştirme)</p>
                        <button className="demo-btn" onClick={() => fillDemo('admin@klinik.com')}>
                            <strong>👩‍⚕️ Başhekim / Yönetici</strong>
                            <span>admin@klinik.com</span>
                        </button>
                        <button className="demo-btn" onClick={() => fillDemo('doktor@klinik.com')}>
                            <strong>🩺 Doktor</strong>
                            <span>doktor@klinik.com</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
