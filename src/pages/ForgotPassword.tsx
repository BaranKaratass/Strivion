import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code;
      if (msg === 'auth/user-not-found') {
        setError('Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.');
      } else {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/8 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10"
      >
        <AnimatePresence mode="wait">
          {!sent ? (
            /* ─── Form ─── */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl"
            >
              {/* Icon & Title */}
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-4">
                  <KeyRound size={24} />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Şifremi Unuttum</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  E-posta adresini gir, sıfırlama bağlantısını hemen gönderelim.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleReset} className="space-y-6">
                <Input
                  label="E-posta Adresi"
                  type="email"
                  placeholder="isim@ornek.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  error={error}
                />

                <Button type="submit" loading={loading} variant="secondary">
                  Sıfırlama Bağlantısı Gönder
                </Button>
              </form>

              {/* Back Link */}
              <div className="flex items-center justify-center">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
                >
                  <ArrowLeft size={14} />
                  Giriş ekranına dön
                </Link>
              </div>
            </motion.div>
          ) : (
            /* ─── Success State ─── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                className="mx-auto w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center"
              >
                <CheckCircle2 size={32} className="text-emerald-400" />
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Bağlantı Gönderildi!</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  <span className="text-white font-medium">{email}</span> adresine şifre sıfırlama bağlantısı gönderildi. Spam klasörünü de kontrol etmeyi unutma.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="w-full py-3 px-6 rounded-xl font-semibold bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all text-sm"
                >
                  Farklı bir e-posta dene
                </motion.button>
                <Link
                  to="/login"
                  className="block w-full py-3 px-6 rounded-xl font-semibold bg-white text-black text-center hover:bg-slate-200 transition-colors text-sm"
                >
                  Giriş Ekranına Dön
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
