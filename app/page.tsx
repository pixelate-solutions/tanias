// app/page.tsx
'use client';

import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';

const tools = [
  {
    title: 'Inventory',
    description: 'Manage stock levels',
    href: '/inventory',
  },
  {
    title: 'Billing',
    description: 'View & create invoices',
    href: '/billing',
  },
  {
    title: 'Tips',
    description: 'Track & distribute tips',
    href: '/tips',
  },
  {
    title: 'Alerts',
    description: 'Sales‑per‑labor‑hour alerts',
    href: '/alerts',
  },
  {
    title: 'Vertical Shelf',
    description: 'Coming soon…',
    href: '/vertical-shelf',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto p-6">
        <p className="text-center text-gray-700 mb-8 text-lg">
          Select a tool below to get started.
        </p>

        <nav>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool) => (
              <Link key={tool.title} href={tool.href}>
                <Card className="border-2 border-transparent hover:border-[#E10600] hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-[#E10600]">{tool.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </nav>
      </main>
    </div>
  );
}
