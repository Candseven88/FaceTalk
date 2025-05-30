import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../lib/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackgroundAnimation from './components/BackgroundAnimation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FaceTalk - AI Portrait Animation',
  description: 'Generate animated portraits, clone voices, and create talking portraits with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider>
          <BackgroundAnimation />
          <Navbar />
          <main className="flex-grow pt-16">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
} 