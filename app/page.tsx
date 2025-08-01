import CountdownClock from "@/components/ui/countdownClock";
import Image from "next/image";

export default function Home() {
  return (
    <main className="p-6 w-auto mx-auto min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <div className="bg-white w-auto mb-8">
          <Image src="/logo.svg" alt="The League" width={250} height={40} />
        </div>
        <CountdownClock
          targetDate="2025-08-08T15:00:00"
          password="oscarbobb"
          passwordHint="He broke his leg in pre-season"
          redirectUrl="/info"
        />
    </main>
  );
}
