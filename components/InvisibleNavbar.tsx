'use client';

import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {routing} from '@/i18n/routing';
import styles from './InvisibleNavbar.module.css';

export default function InvisibleNavbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      {routing.locales.map(locale => (
        <Link key={locale} href={pathname} locale={locale} className={styles.link}>
          {locale.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
