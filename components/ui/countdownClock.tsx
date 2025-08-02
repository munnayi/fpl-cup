'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface CountdownClockProps {
  targetDate: Date | string;
  password?: string;
  passwordHint?: string;
  redirectUrl?: string;
}

const CountdownClock: React.FC<CountdownClockProps> = ({
  targetDate,
  password,
  passwordHint,
  redirectUrl = '/',
}) => {
  const router = useRouter();

  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();

    if (difference <= 0) {
      return null;
    }

    return {
      days: String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, '0'),
      hours: String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
      minutes: String(Math.floor((difference / 1000 / 60) % 60)).padStart(2, '0'),
      seconds: String(Math.floor((difference / 1000) % 60)).padStart(2, '0'),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isComplete, setIsComplete] = useState(timeLeft === null);
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!timeLeft) return;

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      if (newTimeLeft) {
        setTimeLeft(newTimeLeft);
      } else {
        setTimeLeft(null);
        setIsComplete(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const handleSubmit = () => {
    if (inputPassword === password) {
      router.push(redirectUrl);
    } else {
      setError('Incorrect password');
    }
  };

  if (isComplete) {
    return (
      <Card className="w-full max-w-md mx-auto rounded-2xl shadow-lg p-6 bg-white dark:bg-gray-900">
        <CardContent className="space-y-4 p-2 md:p-6">
          <div>
            <Label htmlFor="password" className="text-md text-gray-800 dark:text-white">
              Name Gman's 11th round pick in the 2024/25 draft
            </Label>
            <Input
              id="password"
              type="password"
              value={inputPassword}
              onChange={(e) => {
                setInputPassword(e.target.value);
                setError('');
              }}
              className="mt-2"
              placeholder="Enter password"
            />
            {passwordHint && (
              <p className="text-sm text-muted-foreground mt-2">✨ Hint: {passwordHint}</p>
            )}
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>
          <Button className="w-full" onClick={handleSubmit}>
            Submit
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto rounded-2xl shadow-lg p-4 bg-white dark:bg-gray-900">
      <CardContent className="flex justify-between text-center text-gray-900 dark:text-white text-xl font-mono font-semibold p-2">
        <div className="flex-1">
          <div className="text-4xl">{timeLeft?.days}</div>
          <div className="uppercase text-sm tracking-wide mt-1">Days</div>
        </div>
        <div className="flex-1">
          <div className="text-4xl">{timeLeft?.hours}</div>
          <div className="uppercase text-sm tracking-wide mt-1">Hours</div>
        </div>
        <div className="flex-1">
          <div className="text-4xl">{timeLeft?.minutes}</div>
          <div className="uppercase text-sm tracking-wide mt-1">Minutes</div>
        </div>
        <div className="flex-1">
          <div className="text-4xl">{timeLeft?.seconds}</div>
          <div className="uppercase text-sm tracking-wide mt-1">Seconds</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountdownClock;
