// features/user/ChangePassword.tsx
import { useState, FormEvent } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/custom/PageLayout';
import { useChangePassword } from './Hooks/useUsers';

interface FieldErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

const MIN_LENGTH = 8;

export default function ChangePassword() {
  const { changePassword, isPending } = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const next: FieldErrors = {};

    if (!currentPassword) {
      next.currentPassword = 'Enter your current password';
    }

    if (!newPassword) {
      next.newPassword = 'Enter a new password';
    } else if (newPassword.length < MIN_LENGTH) {
      next.newPassword = `Must be at least ${MIN_LENGTH} characters`;
    } else if (newPassword === currentPassword) {
      next.newPassword = 'New password must be different from the current one';
    }

    if (!confirmNewPassword) {
      next.confirmNewPassword = 'Confirm your new password';
    } else if (confirmNewPassword !== newPassword) {
      next.confirmNewPassword = 'Passwords do not match';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    changePassword(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
          setErrors({});
        },
      }
    );
  };

  return (
    <PageLayout title="Change Password">
      <div className=" max-w-md">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white border rounded-lg p-5 md:p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Lock className="h-4 w-4" />
            <span>Choose a strong password you don't use elsewhere.</span>
          </div>

          <PasswordField
            id="currentPassword"
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            onToggleShow={() => setShowCurrent(v => !v)}
            error={errors.currentPassword}
            autoComplete="current-password"
          />

          <PasswordField
            id="newPassword"
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggleShow={() => setShowNew(v => !v)}
            error={errors.newPassword}
            autoComplete="new-password"
          />

          <PasswordField
            id="confirmNewPassword"
            label="Confirm New Password"
            value={confirmNewPassword}
            onChange={setConfirmNewPassword}
            show={showConfirm}
            onToggleShow={() => setShowConfirm(v => !v)}
            error={errors.confirmNewPassword}
            autoComplete="new-password"
          />

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </PageLayout>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  error?: string;
  autoComplete?: string;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  error,
  autoComplete,
}: PasswordFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={error ? 'border-red-400 focus-visible:ring-red-400 pr-10' : 'pr-10'}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
