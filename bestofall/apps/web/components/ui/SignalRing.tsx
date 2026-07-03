'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface SignalRingProps {
  score: number; // 0-100
  size?: number;
  isBest?: boolean;
  className?: string;
}

/**
 * The Signal Ring is BestOfAll's answer to "which one should I actually
 * pick?" — a single glanceable ring that encodes price, speed, rating,
 * discount and distance into one number, instead of making the user weigh
 * five separate stats per card. The best-overall card in a result set gets
 * a glowing teal ring; everything else reads on a calmer indigo scale.
 */
export function SignalRing({ score, size = 56, isBest = false, className }: SignalRingProps) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  const color = isBest ? '#17E3C2' : score >= 60 ? '#4F6BFF' : '#9297A8';

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`BestOfAll signal score: ${score} out of 100${isBest ? ', best overall pick' : ''}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-black/8 dark:stroke-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={isBest ? { filter: 'drop-shadow(0 0 6px rgba(23,227,194,0.7))' } : undefined}
        />
      </svg>
      <span className="absolute font-mono text-xs font-semibold tabular-nums">{score}</span>
    </div>
  );
}
