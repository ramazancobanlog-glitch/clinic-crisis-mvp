import './globals.css';

export const metadata = {
  title: 'KlinikKriz - Doğum Kliniği Kriz & Operasyon Yönetimi',
  description: 'Doğum klinikleri için SaaS tabanlı dijital kriz ve operasyon yönetim platformu',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
