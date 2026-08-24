import { FormEvent, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Lock, ArrowLeft, KeyRound } from 'lucide-react';
import { useResetPassword } from './authHooks/useResetPassword';
import { IPasswordReset } from '../../interfaces';
import { infoConfig } from '../../config/config-info';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import ShowPasswordIcon from '../../components/custom/ShowPasswordIcon';

const ResetPasswordForm: React.FC = () => {
  const [formData, setFormData] = useState<Partial<IPasswordReset>>({
    password: '',
    passwordConfirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { token } = useParams<{ token: string }>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value.trim() }));
  };

  const { resetPassword, isPending } = useResetPassword(token!);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetPassword({
      password: formData.password,
      passwordConfirm: formData.passwordConfirm,
    });
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Password validation
  const passwordMatch = formData.password === formData.passwordConfirm;
  const passwordLength = formData.password!.length >= 8;

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
        {/* <h1 className="text-xl md:text-2xl font-extrabold text-center text-brand-800 uppercase tracking-widest font-jaro mb-2">
          {infoConfig.name}
        </h1> */}
        <p className="text-center text-gray-600 text-sm mb-6">Create a new password</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              id="password"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={formData.password}
              onChange={handleInputChange}
              leftIcon={<Lock className="w-4 h-4" />}
              required
              error={
                formData.password && !passwordLength
                  ? 'Password must be at least 8 characters'
                  : undefined
              }
              helper="Minimum 8 characters"
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

          <div className="relative">
            <Input
              id="passwordConfirm"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.passwordConfirm}
              onChange={handleInputChange}
              leftIcon={<KeyRound className="w-4 h-4" />}
              required
              error={
                formData.passwordConfirm && !passwordMatch ? 'Passwords do not match' : undefined
              }
            />
            <button
              type="button"
              onClick={handleShowConfirmPassword}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              <ShowPasswordIcon showPassword={showConfirmPassword} />
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
            disabled={!passwordMatch || !passwordLength || !formData.password}
            leftIcon={<KeyRound className="w-4 h-4" />}
          >
            Reset Password
          </Button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center">
          <NavLink
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </NavLink>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-white/80 font-medium text-center">
        &copy; {infoConfig.date} {infoConfig.name}. All rights reserved.
      </p>
    </div>
  );
};

export default ResetPasswordForm;
