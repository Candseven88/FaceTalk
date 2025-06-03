import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../lib/AuthContext';
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject = t;
                var ttq = w[t] = w[t] || [];
                ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie"];
                ttq.setAndDefer = function (t, e) {
                  t[e] = function () {
                    t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
                  }
                };
                for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
                ttq.instance = function (t) {
                  for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
                  return e
                };
                ttq.load = function (e, n) {
                  var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
                  ttq._i = ttq._i || {};
                  ttq._i[e] = [];
                  ttq._i[e]._u = i;
                  ttq._t = ttq._t || {};
                  ttq._t[e] = +new Date;
                  ttq._o = ttq._o || {};
                  ttq._o[e] = n || {};
                  var o = document.createElement("script");
                  o.type = "text/javascript";
                  o.async = !0;
                  o.src = i + "?sdkid=" + e + "&lib=" + t;
                  var a = document.getElementsByTagName("script")[0];
                  a.parentNode.insertBefore(o, a)
                };
                ttq.load('CSOP5LRC77U4SATU2CG0');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      </head>
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
