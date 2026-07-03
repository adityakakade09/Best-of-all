'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { AuthResponse } from '@bestofall/shared';
import { api, ApiClientError } from '@/lib/apiClient';
import { useAuthStore } from '@/lib/authStore';
import { Phone, ShieldCheck, User, ArrowLeft } from 'lucide-react';

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [needsName, setNeedsName] = useState(false);
  const [loading, setLoading] = useState(false);

  const normalizedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;

  const requestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ message: string; devMode: boolean }>('/auth/otp/request', {
        phone: normalizedPhone,
      });
      toast.success(res.message);
      setStep('otp');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/otp/verify', {
        phone: normalizedPhone,
        otp,
        name: needsName ? name : undefined,
      });
      setSession(res.user, res.tokens);
      toast.success(res.isNewUser ? `Welcome to BestOfAll, ${res.user.name}!` : `Welcome back, ${res.user.name}!`);
      router.push('/');
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'NAME_REQUIRED') {
        setNeedsName(true);
        toast('Tell us your name to finish signing up', { icon: '👋' });
      } else {
        toast.error(err instanceof ApiClientError ? err.message : 'Verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full rounded-xl3 p-8"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-signal-indigo to-signal-teal text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl font-semibold">
            {step === 'phone' ? 'Sign in to BestOfAll' : 'Verify your number'}
          </h1>
          <p className="mt-1 text-sm text-ink-muted dark:text-ink-muted-dark">
            {step === 'phone'
              ? 'Just your number — no passwords needed.'
              : `Enter the OTP sent to ${normalizedPhone}`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.form
              key="phone"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              onSubmit={requestOtp}
              className="flex flex-col gap-4"
            >
              <label className="flex items-center gap-2 rounded-xl2 border border-black/10 dark:border-white/10 px-4 py-3">
                <Phone className="h-4 w-4 text-ink-muted dark:text-ink-muted-dark" />
                <span className="text-sm text-ink-muted dark:text-ink-muted-dark">+91</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  inputMode="numeric"
                  required
                  className="flex-1 bg-transparent outline-none"
                />
              </label>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending OTP…' : 'Send OTP'}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              onSubmit={verifyOtp}
              className="flex flex-col gap-4"
            >
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                inputMode="numeric"
                maxLength={6}
                required
                className="rounded-xl2 border border-black/10 dark:border-white/10 px-4 py-3 text-center text-lg tracking-[0.5em] outline-none"
              />
              <p className="text-center text-xs text-ink-muted dark:text-ink-muted-dark">
                Demo mode: use <span className="font-mono font-semibold">123456</span>
              </p>

              {needsName && (
                <label className="flex items-center gap-2 rounded-xl2 border border-black/10 dark:border-white/10 px-4 py-3">
                  <User className="h-4 w-4 text-ink-muted dark:text-ink-muted-dark" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="flex-1 bg-transparent outline-none"
                  />
                </label>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Verifying…' : needsName ? 'Create account' : 'Verify & Sign in'}
              </button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex items-center justify-center gap-1 text-xs text-ink-muted dark:text-ink-muted-dark hover:text-signal-indigo"
              >
                <ArrowLeft className="h-3 w-3" /> Change number
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
