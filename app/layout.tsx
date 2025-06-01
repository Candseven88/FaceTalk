import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../lib/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackgroundAnimation from './components/BackgroundAnimation';
import Script from 'next/script';

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
        <Script id="reset-points" strategy="beforeInteractive">
          {`
          (function() {
            console.log('检查并重置积分...');
            const storedPoints = localStorage.getItem('facetalk_points');
            
            // 检查是否有历史存储值
            if (storedPoints !== null) {
              const points = parseInt(storedPoints, 10);
              // 如果当前存储值是100，则重置为4
              if (points === 100) {
                console.log('检测到旧的积分值(100)，重置为4点');
                localStorage.setItem('facetalk_points', '4');
              } else {
                console.log('当前积分:', points);
              }
            } else {
              // 没有积分记录，设置为4
              console.log('未检测到积分记录，设置为4点');
              localStorage.setItem('facetalk_points', '4');
            }
          })();
          `}
        </Script>
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