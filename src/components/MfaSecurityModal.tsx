import React, { useState } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  Key, 
  Smartphone, 
  Mail, 
  Lock, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Monitor, 
  Clock, 
  Trash2,
  FileText
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { SystemUser } from '../types';
import { 
  generateBase32Secret, 
  generateOtpAuthUrl, 
  verifyTotpCode, 
  generateBackupCodes 
} from '../utils/mfaEngine';

interface MfaSecurityModalProps {
  user: SystemUser;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUserMfa: (updatedUser: SystemUser) => void;
}

export const MfaSecurityModal: React.FC<MfaSecurityModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUserMfa
}) => {
  const [activeTab, setActiveTab] = useState<'totp' | 'backup' | 'sessions' | 'audit'>('totp');
  const [secretKey, setSecretKey] = useState<string>(user.mfaSecret || generateBase32Secret());
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [copiedSecret, setCopiedSecret] = useState<boolean>(false);
  const [copiedBackup, setCopiedBackup] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [mfaSuccessMsg, setMfaSuccessMsg] = useState<string | null>(null);

  // Backup codes state
  const [backupCodes, setBackupCodes] = useState<string[]>(
    user.mfaBackupCodes && user.mfaBackupCodes.length > 0 
      ? user.mfaBackupCodes 
      : generateBackupCodes()
  );

  if (!isOpen) return null;

  const otpauthUrl = generateOtpAuthUrl(user.email, secretKey, 'InnovistaERP');

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const handleRegenerateSecret = () => {
    const newSec = generateBase32Secret();
    setSecretKey(newSec);
    setVerificationCode('');
    setVerificationError(null);
  };

  const handleRegenerateBackupCodes = () => {
    const newCodes = generateBackupCodes();
    setBackupCodes(newCodes);
    const updated = {
      ...user,
      mfaBackupCodes: newCodes
    };
    onUpdateUserMfa(updated);
    setMfaSuccessMsg('Fresh emergency backup recovery codes generated successfully!');
    setTimeout(() => setMfaSuccessMsg(null), 3000);
  };

  const handleEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);
    setIsVerifying(true);

    const isValid = await verifyTotpCode(secretKey, verificationCode);
    setIsVerifying(false);

    if (!isValid) {
      setVerificationError('Invalid 6-digit passcode. Please check your Authenticator App time and try again (or enter demo code 123456).');
      return;
    }

    const updatedUser: SystemUser = {
      ...user,
      mfaEnabled: true,
      mfaSecret: secretKey,
      mfaType: 'authenticator',
      mfaBackupCodes: backupCodes,
      authAuditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          action: 'MFA Google Authenticator Enabled',
          ipAddress: '127.0.0.1',
          device: 'Desktop Browser (Chrome)'
        },
        ...(user.authAuditLogs || [])
      ]
    };

    onUpdateUserMfa(updatedUser);
    setMfaSuccessMsg('✅ Google Authenticator Multi-Factor Protection enabled!');
    setTimeout(() => {
      setMfaSuccessMsg(null);
    }, 3000);
  };

  const handleDisableMfa = () => {
    const updatedUser: SystemUser = {
      ...user,
      mfaEnabled: false,
      mfaType: 'none',
      authAuditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          action: 'MFA Multi-Factor Disabled',
          ipAddress: '127.0.0.1',
          device: 'Desktop Browser (Chrome)'
        },
        ...(user.authAuditLogs || [])
      ]
    };
    onUpdateUserMfa(updatedUser);
    setMfaSuccessMsg('Multi-Factor Authentication has been disabled.');
    setTimeout(() => setMfaSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-[#0F203C]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#0F203C] p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#E87F24] rounded-xl text-white shadow-md">
              <ShieldCheck className="w-6 h-6 text-[#FFC81E]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-white">MFA Security & Authenticator Center</h3>
                {user.employee_id && (
                  <span className="text-[10px] font-mono font-bold text-[#FFC81E] bg-[#E87F24]/30 border border-[#FFC81E]/40 px-2 py-0.5 rounded-full">
                    {user.employee_id}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#73A5CA]">Manage 2-Factor Authentication, Google Authenticator & Security Sessions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Badge Banner */}
        <div className="bg-[#FEFDDF] border-b border-[#FFC81E]/40 px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#0F203C]">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#0F203C]">{user.name}</span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-slate-700">{user.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-600">Role: <span className="font-bold text-[#E87F24]">{user.role}</span></span>
            <span className="text-slate-400">•</span>
            <span className="font-semibold text-slate-600">Branch: <span className="font-bold text-[#0F203C]">{user.branch_name}</span></span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('totp')}
            className={`pb-2 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'totp'
                ? 'border-[#E87F24] text-[#E87F24] bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Google Authenticator</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'backup'
                ? 'border-[#E87F24] text-[#E87F24] bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Emergency Recovery Codes</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`pb-2 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'sessions'
                ? 'border-[#E87F24] text-[#E87F24] bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Active Sessions</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'audit'
                ? 'border-[#E87F24] text-[#E87F24] bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Security Logs</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {mfaSuccessMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{mfaSuccessMsg}</span>
          </div>
        )}

        {/* Tab 1: Google Authenticator QR Code Setup */}
        {activeTab === 'totp' && (
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {user.mfaEnabled ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-emerald-900">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Multi-Factor Security Active</h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      Your employee account (<span className="font-mono font-bold">{user.employee_id || user.email}</span>) is protected by Google Authenticator TOTP. Every login requires your 6-digit timed passcode.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">CONFIGURED MFA METHOD:</span>
                    <span className="font-bold text-[#E87F24] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                      Google Authenticator / Mobile TOTP
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-700">SECRET KEY:</span>
                    <span className="font-mono font-bold text-slate-900 tracking-wider bg-white px-2 py-1 border border-slate-300 rounded">
                      {user.mfaSecret || secretKey}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleDisableMfa}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition flex items-center space-x-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Disable Multi-Factor Protection</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 bg-[#0F203C] text-white rounded-lg text-xs font-bold shadow-md hover:bg-[#1A2E4E]"
                  >
                    Close Security Center
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Enable 2FA Protection:</strong> Scan the unique QR code below using Google Authenticator, Microsoft Authenticator, or Authy app on your mobile device.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* QR Code Column */}
                  <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                    <div className="bg-white p-3 rounded-lg border border-slate-300 shadow-sm">
                      <QRCodeSVG 
                        value={otpauthUrl} 
                        size={150}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Scan with Google Authenticator
                    </span>
                  </div>

                  {/* Manual Key & Form Column */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">MANUAL SETUP SECRET KEY:</label>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-xs font-bold text-[#0F203C] bg-slate-100 border border-slate-300 px-2.5 py-2 rounded-lg flex-1 truncate">
                          {secretKey}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopySecret}
                          className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 transition"
                          title="Copy Secret Key"
                        >
                          {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={handleRegenerateSecret}
                          className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 transition"
                          title="Regenerate Secret"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleEnableMfa} className="space-y-3 pt-2">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">ENTER 6-DIGIT AUTHENTICATOR CODE:</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="e.g. 123456"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 border border-slate-300 focus:border-[#E87F24] focus:bg-white text-base font-mono font-extrabold text-center tracking-widest p-2.5 rounded-xl"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          💡 Enter the code from Google Authenticator (or use demo code <span className="font-mono font-bold text-[#E87F24]">123456</span>).
                        </p>
                      </div>

                      {verificationError && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] rounded-lg">
                          {verificationError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isVerifying || verificationCode.length < 6}
                        className="w-full bg-[#E87F24] hover:bg-[#D26E1A] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-md transition disabled:opacity-50"
                      >
                        {isVerifying ? 'Verifying Code...' : 'VERIFY & ACTIVATE GOOGLE AUTHENTICATOR'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Emergency Recovery Backup Codes */}
        {activeTab === 'backup' && (
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1">
              <h4 className="font-bold">Emergency Recovery Backup Keys</h4>
              <p className="text-[11px] text-blue-800">
                Store these single-use emergency recovery keys in a secure location. If you lose your phone or mobile authenticator device, you can use any of these keys to sign into your account.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 border border-slate-200 p-4 rounded-xl">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="bg-white border border-slate-300 font-mono font-bold text-center py-2 px-3 rounded-lg text-slate-800 shadow-2xs">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyBackupCodes}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-800 font-bold transition flex items-center space-x-1.5"
              >
                {copiedBackup ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedBackup ? 'Copied to Clipboard!' : 'Copy Backup Keys'}</span>
              </button>

              <button
                type="button"
                onClick={handleRegenerateBackupCodes}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg font-bold transition flex items-center space-x-1.5"
              >
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <span>Generate New Keys</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Active Device Sessions */}
        {activeTab === 'sessions' && (
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">ACTIVE LOGIN SESSIONS</span>
              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                1 Current Session
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-start space-x-3">
                <Monitor className="w-5 h-5 text-[#E87F24] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 flex items-center space-x-2">
                    <span>Desktop Chrome Web Session</span>
                    <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded">THIS DEVICE</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    IP: 127.0.0.1 • Colombo, Sri Lanka • Signed in: {user.last_login || 'Just now'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Security Audit Log */}
        {activeTab === 'audit' && (
          <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto text-xs">
            <span className="font-bold text-slate-800 block">AUTHENTICATION & SECURITY AUDIT TRAIL</span>
            
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Security Event / Action</th>
                    <th className="p-2.5">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {(user.authAuditLogs && user.authAuditLogs.length > 0) ? (
                    user.authAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-600">{log.timestamp}</td>
                        <td className="p-2.5 font-bold text-slate-800">{log.action}</td>
                        <td className="p-2.5 font-mono text-slate-500">{log.ipAddress}</td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-600">{new Date().toLocaleString()}</td>
                        <td className="p-2.5 font-bold text-slate-800">Successful Portal Login (Employee Unique ID verified)</td>
                        <td className="p-2.5 font-mono text-slate-500">127.0.0.1</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-600">{new Date(Date.now() - 3600000).toLocaleString()}</td>
                        <td className="p-2.5 font-bold text-slate-800">Employee Profile Security Hydration</td>
                        <td className="p-2.5 font-mono text-slate-500">127.0.0.1</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
