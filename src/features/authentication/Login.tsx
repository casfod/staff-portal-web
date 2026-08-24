import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useLogin } from './authHooks/useLogin';
import { infoConfig } from '../../config/config-info';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import ShowPasswordIcon from '../../components/custom/ShowPasswordIcon';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-700 to-brand-950 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            className="w-76 h-auto"
            src={infoConfig.bigLogoUrl}
            alt={`${infoConfig.name} logo`}
          />
        </div>

        {/* Title */}
        {/* <h1 className="text-xl md:text-2xl font-extrabold text-center text-brand-800 uppercase tracking-widest font-jaro mb-6">
          {infoConfig.name}
        </h1> */}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
            autoComplete="email"
          />

          <div className="relative">
            <Input
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={handleShowPassword}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <ShowPasswordIcon showPassword={showPassword} />
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Forgot password?{' '}
            <NavLink
              to="/forgot-password"
              className="text-brand-600 hover:text-brand-700 font-semibold underline transition-colors"
            >
              Click here
            </NavLink>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-white/80 font-medium text-center">
        &copy; {infoConfig.date} {infoConfig.name}. All rights reserved.
      </p>
    </div>
  );
}
