import '@/styles/globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing, Locale } from '@/i18n/routing'
import InvisibleNavbar from '@/components/InvisibleNavbar'

export const metadata = {
  title: 'Delivery Order Price Calculator',
  description: 'Calculate your delivery price with ease!',
}

// Next.js 15 works like this apparently
type paramsType = Promise<{ locale: Locale }>

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: paramsType
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  // Load translations for the locale
  const messages = await import(`../../messages/${locale}.json`).then(
    (res) => res.default
  )

  return (
    <html lang={locale}>
      <body>
        <InvisibleNavbar />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
