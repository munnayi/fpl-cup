'use client'

import './globals.css';
import Image from "next/image";
import Link from 'next/link';
import "@fortawesome/fontawesome-svg-core/styles.css";
import TopNav from "@/components/ui/top-nav";
import FooterNav from "@/components/ui/footer-nav";
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()

  const shouldHide = pathname !== '/'

  return (
    <html lang="en">
      <body>
        {shouldHide && (<header className="bg-gray-900 text-white p-4">
          <div className="max-w-4xl flex items-center justify-center md:justify-between mx-auto">
            <Link href="/">
              <div className="bg-white w-auto">
                <Image src="/logo.svg" alt="The League" width={180} height={40} />
              </div>
            </Link>
            <TopNav />
          </div>
        </header> )}
        <div>
          {children}
        </div>
        {shouldHide && (<FooterNav /> )}
      </body>
    </html>
  );
}
