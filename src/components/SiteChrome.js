'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return <>{children}</>;
  return <><Header /><main className="flex-1 w-full max-w-[1440px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-10">{children}</main><Footer /></>;
}
