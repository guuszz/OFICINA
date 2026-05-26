import React, { useState } from 'react';
import { Wrench, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

type Mode = 'login' | 'register';

const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Login realizado!');
      } else {
        await register(form.email, form.password, form.name || undefined);
        toast.success('Conta criada! Bem-vindo(a) à Oficina Mecânica.');
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Erro inesperado';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg mb-4">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Oficina Mecânica
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {mode === 'login' ? 'Entre pra gerenciar sua oficina' : 'Crie sua conta em segundos'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">
                  <UserIcon className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                  Nome (opcional)
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Como podemos te chamar?"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                <Lock className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                required
                minLength={mode === 'register' ? 6 : 1}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === 'login' ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : (
                <>{mode === 'login' ? 'Entrar' : 'Criar conta'}</>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {mode === 'login' ? (
              <>
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Criar uma agora
                </button>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Fazer login
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Sistema multi-tenant — cada conta vê apenas seus próprios dados.
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
