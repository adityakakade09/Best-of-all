import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { noFlashThemeScript } from '@/lib/theme';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700'] });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['500', '600'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://bestofall.app'),
  title: {
    default: 'BestOfAll — Search Once, Compare Everywhere',
    template: '%s | BestOfAll',
  },
  description:
    'BestOfAll is a universal search and comparison platform for food, groceries, medicines, electronics, fashion and gifts — compare price, delivery time, ratings and discounts across Amazon, Flipkart, Swiggy, Zomato, Blinkit, Zepto and more, in one search.',
  keywords: [
    'price comparison',
    'delivery comparison',
    'BestOfAll',
    'compare Swiggy Zomato',
    'compare Amazon Flipkart',
    'online shopping comparison India',
  ],
  openGraph: {
    title: 'BestOfAll — Search Once, Compare Everywhere',
    description:
      'Compare price, delivery time, ratings and discounts across every major platform from a single search bar.',
    type: 'website',
    siteName: 'BestOfAll',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BestOfAll — Search Once, Compare Everywhere',
    description: 'One search bar. Every platform. The best pick, instantly.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F6FA' },
    { media: '(prefers-color-scheme: dark)', color: '#06070C' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body`}>
        <Providers>
          <div className="relative min-h-screen overflow-x-hidden bg-mesh dark:bg-mesh-dark">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-signal-indigo focus:px-4 focus:py-2 focus:text-white"
            >
              Skip to content
            </a>
            <Navbar />
            <main id="main-content">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
