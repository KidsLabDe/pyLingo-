import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'pyLingo - Python lernen mit Spaß',
  description: 'Lerne Python wie mit Duolingo - für die Hackerwerkstatt im KidsLab',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-[#131f24]">
        {children}
      </body>
    </html>
  );
}
