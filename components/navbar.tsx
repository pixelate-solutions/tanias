'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-[#d51f25] shadow p-6">
      <div className="container mx-auto flex justify-center">
        <Link href="/">
          <Image
            src="/tanias-logo.png"
            alt="Tania's Logo"
            width={200}
            height={80}
            className="object-contain"
          />
        </Link>
      </div>
    </nav>
  );
}
