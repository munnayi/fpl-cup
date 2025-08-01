"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faTable, faTrophy } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

export default function FooterNav() {
  const pathname = usePathname();

  const items = [
    { href: "/info", label: "Rules & Info", icon: faTrophy },
    { href: "/fixtures", label: "Fixtures", icon: faCalendar },
    { href: "/table", label: "Table", icon: faTable },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white border-t border-gray-800 md:hidden">
      <div className="flex justify-around">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center py-2 text-xs flex-1",
              pathname === item.href ? "text-green-500" : "text-gray-400"
            )}
          >
            <FontAwesomeIcon icon={item.icon} className="text-lg mb-1" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
