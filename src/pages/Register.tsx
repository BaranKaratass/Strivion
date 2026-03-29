import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile } from '../services/userService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Firestore'da kullanıcı profili oluştur (100 Coin hediye ile)
      await createUserProfile(user.uid, email, email.split('@')[0]);
      
      navigate('/');
    } catch (err: any) {
      setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-4">
            <UserPlus size={24} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Kayıt Ol</h2>
          <p className="text-slate-400">Yeni bir Strivion hesabı oluştur.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="E-posta"
              type="email"
              placeholder="isim@ornek.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Şifre"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Şifreyi Onayla"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              error={error}
            />
          </div>

          <Button type="submit" variant="secondary" loading={loading} className="bg-emerald-600 hover:bg-emerald-700">
            Kayıt Ol
          </Button>
        </form>

        <p className="text-center text-slate-400 text-sm">
          Zaten hesabın var mı?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            Giriş Yap
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
