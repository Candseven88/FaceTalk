import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../lib/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackgroundAnimation from './components/BackgroundAnimation';
import Script from 'next/script';
import TikTokPixel from './components/TikTokPixel';

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
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XQNFKB77RS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XQNFKB77RS');
          `}
        </Script>
        {/* TikTok Pixel - Client Side Component */}
        <TikTokPixel pixelId={process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || ''} />
        <AuthProvider>
          <BackgroundAnimation />
          <Navbar />
          <main className="flex-grow pt-16">{children}</main>
          <Footer />
        </AuthProvider>
        
        {/* Fix credits issue */}
        <Script id="fix-credits" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined') {
              try {
                console.log('Checking and resetting facetalk_points');
                const currentPoints = localStorage.getItem('facetalk_points');
                if (currentPoints === '96' || currentPoints === '100') {
                  console.log('Resetting credits from', currentPoints, 'to 4');
                  localStorage.setItem('facetalk_points', '4');
                  
                  // Force reload the page to apply new credits
                  window.location.reload();
                }
              } catch (e) {
                console.error('Error fixing credits:', e);
              }
            }
          `}
        </Script>
      </body>
    </html>
  );
} 