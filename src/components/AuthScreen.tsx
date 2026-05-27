import React, { useState } from 'react';
import { Wrench, Mail, Lock, User as UserIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '../lib/utils';

type Mode = 'login' | 'register';

const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.email.trim()) next.email = 'Informe seu email';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Email inválido';
    if (!form.password) next.password = 'Informe sua senha';
    else if (mode === 'register' && form.password.length < 6)
      next.password = 'Mínimo 6 caracteres';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Login realizado!');
      } else {
        await register(form.email, form.password, form.name || undefined);
        toast.success('Conta criada! Bem-vindo(a) à OFICINA.');
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

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      {/* Background sutil — slate radial em vez de gradient azul */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 0%, rgba(51,65,85,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 100%, rgba(5,150,105,0.05) 0%, transparent 50%)',
        }}
      />

      <div className="w-full max-w-md animate-fade-in">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Wrench className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-fg">OFICINA</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestão de oficina mecânica</p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-md sm:p-8">
          {/* Tabs Login / Cadastro */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              aria-pressed={mode === 'login'}
              className={cn(
                'rounded px-3 py-2 text-sm font-medium transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                mode === 'login'
                  ? 'bg-card text-fg shadow-sm'
                  : 'text-muted-foreground hover:text-fg'
              )}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              aria-pressed={mode === 'register'}
              className={cn(
                'rounded px-3 py-2 text-sm font-medium transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                mode === 'register'
                  ? 'bg-card text-fg shadow-sm'
                  : 'text-muted-foreground hover:text-fg'
              )}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-fg">
                  Nome <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <div className="relative">
                  <UserIcon
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Como podemos te chamar?"
                    className="pl-9"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-fg">
                Email
              </Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  type="email"
                  required
                  inputMode="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className={cn('pl-9', errors.email && 'border-destructive focus-visible:ring-destructive')}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  onBlur={validate}
                />
              </div>
              {errors.email && (
                <p id="email-error" role="alert" className="text-xs text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-fg">
                Senha
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={mode === 'register' ? 6 : 1}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                  className={cn(
                    'pl-9 pr-10',
                    errors.password && 'border-destructive focus-visible:ring-destructive'
                  )}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  onBlur={validate}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="text-xs text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" disabled={submitting} className="w-full" size="lg">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>{mode === 'login' ? 'Entrando...' : 'Criando conta...'}</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Entrar' : 'Criar conta'}</span>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Sistema multi-tenant — cada conta vê apenas seus próprios dados.
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
