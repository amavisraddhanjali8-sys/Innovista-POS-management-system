import React, { useState } from 'react';
import { Key, ShieldCheck, AlertCircle, CheckCircle2, X, Lock, Eye, EyeOff } from 'lucide-react';
import { SystemUser } from '../types';
import { updateUserPassword } from '../services/api';

interface ChangePasswordModalProps {
  user: SystemUser;
  isOpen: boolean;
  onClose: () => void;
  onPasswordChanged: (updatedUser: SystemUser) => void;
  isForceChange?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  user,
  isOpen,
  onClose,
  onPasswordChanged,
  isForceChange = false
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await updateUserPassword(user.id, newPassword);
      setSuccessMsg('Your password has been changed successfully!');
      setTimeout(() => {
        onPasswordChanged(updatedUser);
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg('Failed to change password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F203C]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#0F203C] p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Lock className="w-5 h-5 text-[#FFC81E]" />
            <div>
              <h3 className="font-bold text-base text-white">Account Password Security</h3>
              <p className="text-xs text-[#73A5CA]">Update passphrase for {user.name} ({user.email})</p>
            </div>
          </div>
          {!isForceChange && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          
          {/* Security Banner Notice */}
          {isForceChange || user.mustChangePassword ? (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-900">First Login Password Update Required:</strong>
                <span>For account security, you must update your password after your first login before continuing.</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center space-x-2">
              <Key className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Only the account owner can change their password. Administrators cannot alter your password.</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            
            {!isForceChange && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">CURRENT PASSWORD:</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold p-3 pr-10 rounded-xl focus:bg-white focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">NEW PASSPHRASE:</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold p-3 pr-10 rounded-xl focus:bg-white focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">CONFIRM NEW PASSPHRASE:</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold p-3 pr-10 rounded-xl focus:bg-white focus:border-orange-500"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-2">
              {!isForceChange && !user.mustChangePassword && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#E87F24] hover:bg-[#D26E1A] text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-md transition"
              >
                {isSubmitting ? 'Updating Passphrase...' : 'Save & Update Passphrase'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
