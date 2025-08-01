"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function TopNav() {
  const pathname = usePathname();

  const items = [
    { href: "/info", label: "Rules & Info" },
    { href: "/fixtures", label: "Fixtures" },
    { href: "/table", label: "League Table" },
  ];

  return (
    <nav className="bg-gray-900 text-white p-4 hidden md:block">
      <div className="max-w-4xl mx-auto flex space-x-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "hover:text-green-400",
              pathname === item.href ? "text-green-500 font-semibold" : "text-gray-300"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
