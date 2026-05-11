import { useEffect, useState } from "react";

const CountdownTimerNew = ({
  targetDate = "2025-11-31T23:59:59",
}) => {
  const [showTimer, setShowTimer] = useState(false);
  useEffect(() => {
    setShowTimer(true);
  }, []);

  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return null; // Time is up
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer); // Cleanup the timer on component unmount
  }, [targetDate]);

  if (!timeLeft) {
    return <div>Time's up!</div>;
  }

  return (
    <>
      {showTimer ? (
        <>
          <div className="d-flex align-items-center justify-content-center gap-1">
            <span className="bg-success">{timeLeft.days}D</span>
            <span className="bg-success">{timeLeft.hours}H</span>
            <span className="bg-success">{timeLeft.minutes}M</span>
            <span className="bg-success">{timeLeft.seconds}S</span>
            </div>
        </>
      ) : (
        " "
      )}
    </>
  );
};

export default CountdownTimerNew;
