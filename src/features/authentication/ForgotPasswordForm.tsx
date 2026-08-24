import { FormEvent, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useForgotPassword } from './authHooks/useforgotPassword';
import { IPasswordForgot } from '../../interfaces';
import { infoConfig } from '../../config/config-info';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const ForgotPasswordForm: React.FC = () => {
  const [formData, setFormData] = useState<IPasswordForgot>({
    email: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value.trim() }));
  };

  const { forgotPassword, isPending } = useForgotPassword();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    forgotPassword({ email: formData.email });
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
        {/* <h1 className="text-xl md:text-2xl font-extrabold text-center text-brand-800 uppercase tracking-widest font-jaro mb-2">
          {infoConfig.name}
        </h1> */}
        <p className="text-center text-gray-600 text-sm mb-6">Reset your password</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="Enter your registered email"
            value={formData.email}
            onChange={handleInputChange}
            leftIcon={<Mail className="w-4 h-4" />}
            required
            helper="We'll send you a password reset link"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send Reset Link
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

export default ForgotPasswordForm;
