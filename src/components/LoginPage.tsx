import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  ArrowRight, 
  Info,
  X,
  Search,
  Lock,
  Smartphone,
  Mail,
  RefreshCw,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
  ShieldAlert,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { CompanyLogo } from './CompanyLogo';
import { SystemUser, Branch } from '../types';
import { INITIAL_USERS, INITIAL_COMPANY_SETTINGS } from '../data/initialData';
import { addUser, fetchUsers, updateUser, fetchCompanySettings } from '../services/api';
import { 
  verifyTotpCode, 
  getPasswordStrength, 
  generateBase32Secret, 
  generateOtpAuthUrl, 
  generateBackupCodes,
  generateTotpCode,
  generateEmailOtp
} from '../utils/mfaEngine';

interface LoginPageProps {
  onLoginSuccess: (user: SystemUser) => void;
  branches: Branch[];
  sessionNotice?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, branches, sessionNotice }) => {
  const [selectedRole, setSelectedRole] = useState<'Super Admin' | 'Branch Manager' | 'Sales Executive'>('Super Admin');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || 'b-ho');
  const [identifier, setIdentifier] = useState<string>('EMP-1001');
  const [password, setPassword] = useState<string>('admin123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Failed login rate limiting state
  const [failedAttempts, setFailedAttempts] = useState<Record<string, number>>({});
  const [lockedOutUsers, setLockedOutUsers] = useState<Record<string, number>>({});

  // MFA Challenge State
  const [pendingMfaUser, setPendingMfaUser] = useState<SystemUser | null>(null);
  const [mfaCodeInput, setMfaCodeInput] = useState<string>('');
  const [mfaErrorMsg, setMfaErrorMsg] = useState<string | null>(null);
  const [isVerifyingMfa, setIsVerifyingMfa] = useState<boolean>(false);

  // Request Account Access Modal State
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [requestForm, setRequestForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Sales Executive' as 'Super Admin' | 'HO Admin' | 'Branch Manager' | 'Sales Executive',
    branch_id: branches[0]?.id || 'b-ho',
    reason: ''
  });
  const [requestSubmitted, setRequestSubmitted] = useState<boolean>(false);

  // Forgot Email / Password Recovery Modal State
  const [showRecoveryModal, setShowRecoveryModal] = useState<boolean>(false);
  const [recoveryTab, setRecoveryTab] = useState<'ho_backup_key' | 'otp'>('ho_backup_key');
  const [recoveryEmailInput, setRecoveryEmailInput] = useState<string>('');
  const [selectedRecoveryUser, setSelectedRecoveryUser] = useState<SystemUser | null>(null);
  const [recoveryStep, setRecoveryStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [simulatedOtpCode, setSimulatedOtpCode] = useState<string>('');
  const [userEnteredOtp, setUserEnteredOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [otpErrorMsg, setOtpErrorMsg] = useState<string | null>(null);

  // HO Emergency Backup Key Recovery States
  const [hoBackupKeyInput, setHoBackupKeyInput] = useState<string>('');
  const [showHoBackupKeySecret, setShowHoBackupKeySecret] = useState<boolean>(false);
  const [hoBackupErrorMsg, setHoBackupErrorMsg] = useState<string | null>(null);
  const [hoBackupSuccessMsg, setHoBackupSuccessMsg] = useState<string | null>(null);

  // New Account Signup & Google Authenticator 2FA QR Code Verification State
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);
  const [signupStep, setSignupStep] = useState<'info' | 'qr_verify' | 'success'>('info');
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Sales Executive' as 'Super Admin' | 'HO Admin' | 'Branch Manager' | 'Sales Executive',
    branch_id: branches[0]?.id || 'b-ho',
    employee_id: ''
  });
  const [showSignupPassword, setShowSignupPassword] = useState<boolean>(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState<boolean>(false);

  // Google Authenticator TOTP Setup State for Signup
  const [signupSecret, setSignupSecret] = useState<string>('');
  const [signupBackupCodes, setSignupBackupCodes] = useState<string[]>([]);
  const [signupTotpCode, setSignupTotpCode] = useState<string>('');
  const [signupMfaError, setSignupMfaError] = useState<string | null>(null);
  const [isVerifyingSignupMfa, setIsVerifyingSignupMfa] = useState<boolean>(false);
  const [copiedSignupSecret, setCopiedSignupSecret] = useState<boolean>(false);
  const [copiedSignupBackup, setCopiedSignupBackup] = useState<boolean>(false);
  const [createdSignupUser, setCreatedSignupUser] = useState<SystemUser | null>(null);

  // Launch Google Authenticator Signup Wizard
  const handleOpenSignupModal = () => {
    const newSec = generateBase32Secret();
    const newCodes = generateBackupCodes();
    const randomEmpId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    setSignupSecret(newSec);
    setSignupBackupCodes(newCodes);
    setSignupForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'Sales Executive',
      branch_id: branches[0]?.id || 'b-ho',
      employee_id: randomEmpId
    });
    setSignupTotpCode('');
    setSignupMfaError(null);
    setSignupStep('info');
    setShowSignupModal(true);
  };

  // Unified helper to retrieve combined user dataset (Server API + Local Storage Persistence)
  const getCombinedUsers = async (): Promise<SystemUser[]> => {
    let dbUsers: SystemUser[] = [];
    try {
      dbUsers = await fetchUsers();
    } catch (e) {
      console.warn('Failed to fetch users from server, falling back to local dataset:', e);
    }
    if (!Array.isArray(dbUsers) || dbUsers.length === 0) {
      dbUsers = [...INITIAL_USERS];
    } else {
      dbUsers = [...dbUsers];
    }

    try {
      const localRegistered: SystemUser[] = JSON.parse(localStorage.getItem('innovista_registered_users') || '[]');
      if (Array.isArray(localRegistered) && localRegistered.length > 0) {
        localRegistered.forEach(localU => {
          const idx = dbUsers.findIndex(u => 
            (u.id && localU.id && u.id === localU.id) ||
            (u.email && localU.email && u.email.toString().trim().toLowerCase() === localU.email.toString().trim().toLowerCase()) ||
            (u.employee_id && localU.employee_id && u.employee_id.toString().trim().toLowerCase() === localU.employee_id.toString().trim().toLowerCase())
          );
          if (idx !== -1) {
            dbUsers[idx] = { ...dbUsers[idx], ...localU };
          } else {
            dbUsers.unshift(localU);
          }
        });
      }
    } catch (e) {
      console.warn('Error merging local registered users from localStorage:', e);
    }

    return dbUsers;
  };

  // Step 1 Submission -> Verify account doesn't exist and proceed to 2FA QR Code Scan
  const handleSignupInfoNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupMfaError(null);

    const emailClean = signupForm.email.trim().toLowerCase();

    if (!signupForm.name.trim() || !emailClean) {
      setSignupMfaError('Please enter your full name and valid work email address.');
      return;
    }

    if (!signupForm.password) {
      setSignupMfaError('Please set a password for your new system account.');
      return;
    }

    if (signupForm.password.length < 6) {
      setSignupMfaError('Password must be at least 6 characters in length.');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupMfaError('Passwords do not match. Please re-type your confirm password.');
      return;
    }

    // Verify if account / email already exists in system database BEFORE scanning QR code
    try {
      const dbUsers = await getCombinedUsers();
      const existing = dbUsers.find(u => 
        (u.email && u.email.toString().trim().toLowerCase() === emailClean) ||
        (u.employee_id && signupForm.employee_id && u.employee_id.toString().trim().toUpperCase() === signupForm.employee_id.trim().toUpperCase())
      );

      if (existing) {
        if (existing.email && existing.email.toString().trim().toLowerCase() === emailClean) {
          setSignupMfaError(`An account with email "${signupForm.email.trim()}" is ALREADY registered in the system. Please sign in or use a different email.`);
        } else {
          setSignupMfaError(`Employee ID "${signupForm.employee_id}" is ALREADY assigned to an existing account.`);
        }
        return;
      }
    } catch (err) {
      console.error('Failed to check existing users:', err);
    }

    // Advance to Step 2: Google Authenticator QR Code scanning & 2FA verification
    setSignupStep('qr_verify');
  };

  // Step 2 Submission -> Verify Google Authenticator 6-digit TOTP & Register User
  const handleVerifySignupAndCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupMfaError(null);
    setIsVerifyingSignupMfa(true);

    const cleanCode = signupTotpCode.trim().replace(/\s+/g, '');
    if (!cleanCode) {
      setSignupMfaError('Please enter the 6-digit code from Google Authenticator.');
      setIsVerifyingSignupMfa(false);
      return;
    }

    // Validate TOTP code using RFC 6238 time steps or backup codes
    const isBackupUsed = signupBackupCodes.map(c => c.replace('-', '')).includes(cleanCode.toUpperCase().replace('-', ''));
    const isValidTotp = await verifyTotpCode(signupSecret, cleanCode, signupBackupCodes);

    if (!isValidTotp && !isBackupUsed) {
      setIsVerifyingSignupMfa(false);
      setSignupMfaError('Invalid 6-digit Authenticator code. Please check the live code in Google Authenticator or use a backup key.');
      return;
    }

    try {
      const branchObj = branches.find(b => b.id === signupForm.branch_id);
      const newUserId = `user-${Date.now()}`;
      const newUserObj: SystemUser = {
        id: newUserId,
        employee_id: signupForm.employee_id || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        name: signupForm.name.trim(),
        email: signupForm.email.trim().toLowerCase(),
        phone: signupForm.phone.trim(),
        role: signupForm.role,
        branch_id: signupForm.branch_id,
        branch_name: branchObj ? branchObj.name : 'Colombo Head Office',
        status: 'Active',
        mfaEnabled: true,
        mfaSecret: signupSecret,
        mfaBackupCodes: signupBackupCodes,
        password: signupForm.password,
        last_login: new Date().toLocaleString(),
        authAuditLogs: [
          {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            action: 'Account Self-Registration & Google Authenticator Bound',
            ipAddress: '127.0.0.1',
            device: 'Desktop Web Client - Self Registration'
          }
        ]
      };

      let created: SystemUser;
      try {
        created = await addUser(newUserObj);
      } catch (apiErr: any) {
        console.warn('addUser API failed, completing user account creation locally:', apiErr);
        created = newUserObj;
      }

      // Persist registered user to localStorage as fallback so login is always guaranteed
      try {
        const stored = JSON.parse(localStorage.getItem('innovista_registered_users') || '[]');
        const updated = [created, ...stored.filter((u: any) => u.email !== created.email && u.employee_id !== created.employee_id)];
        localStorage.setItem('innovista_registered_users', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist created user to localStorage:', e);
      }

      setIsVerifyingSignupMfa(false);
      setCreatedSignupUser(created);
      setSignupStep('success');
    } catch (err: any) {
      setIsVerifyingSignupMfa(false);
      setSignupMfaError(err.message || 'Failed to create system user account. Email address or ID may already be registered.');
    }
  };

  const handleCopySignupSecret = () => {
    navigator.clipboard.writeText(signupSecret);
    setCopiedSignupSecret(true);
    setTimeout(() => setCopiedSignupSecret(false), 2000);
  };

  const handleCopySignupBackupCodes = () => {
    navigator.clipboard.writeText(signupBackupCodes.join('\n'));
    setCopiedSignupBackup(true);
    setTimeout(() => setCopiedSignupBackup(false), 2000);
  };

  // Handle Preset Quick Login Selection
  const handleQuickPreset = (presetRole: 'Super Admin' | 'Branch Manager' | 'Sales Executive', presetIdent: string) => {
    setSelectedRole(presetRole);
    setIdentifier(presetIdent);
    setPassword('admin123');
    setErrorMsg(null);
  };

  // Perform Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const dbUsers = await getCombinedUsers();
      const cleanIdent = identifier.trim().toLowerCase();

      // Check lockout status
      const now = Date.now();
      if (cleanIdent && lockedOutUsers[cleanIdent] && lockedOutUsers[cleanIdent] > now) {
        const remainingSec = Math.ceil((lockedOutUsers[cleanIdent] - now) / 1000);
        setErrorMsg(`Account temporarily locked due to repeated failed login attempts. Please wait ${remainingSec}s or contact Admin.`);
        setIsLoading(false);
        return;
      }

      // Find user by email, employee_id or ID match
      let matchedUser = dbUsers.find(u => 
        (u.email && u.email.trim().toLowerCase() === cleanIdent) || 
        (u.employee_id && u.employee_id.trim().toLowerCase() === cleanIdent) ||
        (u.id && u.id.trim().toLowerCase() === cleanIdent)
      );

      // If user did not type an identifier but clicked preset role button
      if (!matchedUser && !cleanIdent) {
        matchedUser = dbUsers.find(u => u.role === selectedRole);
      }

      if (!matchedUser) {
        setErrorMsg(`Account not found for "${identifier}". Please check your email / Employee ID or register a new account.`);
        setIsLoading(false);
        return;
      }

      // Strict Access Control & Role Validation:
      // Prevent Sales Executives from logging in under Admin or Manager roles, and vice versa
      if (matchedUser.role === 'Sales Executive') {
        if (selectedRole !== 'Sales Executive') {
          setErrorMsg(`Access Denied: Sales Executive accounts are strictly prohibited from logging in under ${selectedRole === 'Super Admin' ? 'HO Admin' : selectedRole} portal access role. Please select 'Sales Exec' portal role.`);
          setIsLoading(false);
          return;
        }
      } else if (selectedRole === 'Sales Executive') {
        if (matchedUser.role === 'Super Admin' || matchedUser.role === 'HO Admin' || matchedUser.role === 'Branch Manager') {
          setErrorMsg(`Access Denied: Administrator and Manager accounts cannot be accessed under the 'Sales Exec' portal access role. Please select '${matchedUser.role === 'Branch Manager' ? 'Manager' : 'HO Admin'}' portal access role.`);
          setIsLoading(false);
          return;
        }
      } else if (selectedRole === 'Branch Manager') {
        if (matchedUser.role !== 'Branch Manager') {
          setErrorMsg(`Access Denied: Account '${matchedUser.name}' (${matchedUser.email || matchedUser.employee_id}) has assigned role '${matchedUser.role}' and cannot log in under 'Manager' portal access role.`);
          setIsLoading(false);
          return;
        }
      } else if (selectedRole === 'Super Admin') {
        if (matchedUser.role !== 'Super Admin' && matchedUser.role !== 'HO Admin') {
          setErrorMsg(`Access Denied: Account '${matchedUser.name}' (${matchedUser.email || matchedUser.employee_id}) has assigned role '${matchedUser.role}' and cannot log in under 'HO Admin' portal access role.`);
          setIsLoading(false);
          return;
        }
      }

      // Validate Password if set on account
      const cleanTypedPassword = password.trim();
      const userStoredPassword = matchedUser.password ? matchedUser.password.trim() : '';

      if (userStoredPassword) {
        if (cleanTypedPassword !== userStoredPassword) {
          const attempts = (failedAttempts[cleanIdent] || 0) + 1;
          setFailedAttempts(prev => ({ ...prev, [cleanIdent]: attempts }));
          if (attempts >= 5) {
            setLockedOutUsers(prev => ({ ...prev, [cleanIdent]: Date.now() + 5 * 60 * 1000 }));
            setErrorMsg('Security Rate Limit Reached: 5 failed login attempts. Account locked for 5 minutes.');
          } else {
            setErrorMsg(`Invalid password. Please check your password (${5 - attempts} attempts remaining).`);
          }
          setIsLoading(false);
          return;
        }
      }

      // Password matches or not set - clear failed attempts and lockouts
      if (cleanIdent) {
        setFailedAttempts(prev => {
          const copy = { ...prev };
          delete copy[cleanIdent];
          return copy;
        });
        setLockedOutUsers(prev => {
          const copy = { ...prev };
          delete copy[cleanIdent];
          return copy;
        });
      }

      // Check account status restrictions
      if (matchedUser.status === 'Deactivated') {
        setErrorMsg('This account has been deactivated by the Administrator. Please contact Head Office.');
        setIsLoading(false);
        return;
      }

      if (matchedUser.status === 'Pending Approval') {
        setErrorMsg('Your account request is pending Administrator signoff and approval.');
        setIsLoading(false);
        return;
      }

      // Auto-align operational branch dropdown to matched user's assigned branch
      if (matchedUser.branch_id && matchedUser.role !== 'Super Admin') {
        setSelectedBranchId(matchedUser.branch_id);
      }

      // Check Branch Appointment and Operational Status
      const activeBranchId = (matchedUser.role !== 'Super Admin' && matchedUser.branch_id) ? matchedUser.branch_id : selectedBranchId;
      const targetBranch = branches.find(b => b.id === activeBranchId || b.code === activeBranchId) || branches[0];
      const isSuperAdminOrHO = matchedUser.role === 'Super Admin' || matchedUser.role === 'HO Admin' || matchedUser.branch_id === 'b-ho';

      if (!isSuperAdminOrHO) {
        if (matchedUser.branch_id && matchedUser.branch_id !== targetBranch?.id && matchedUser.branch_id !== targetBranch?.code) {
          const appointedBranch = branches.find(b => b.id === matchedUser.branch_id || b.code === matchedUser.branch_id);
          setErrorMsg(`Branch Access Denied: Your account is appointed to "${appointedBranch?.name || matchedUser.branch_name || matchedUser.branch_id}". You are not permitted to log in to "${targetBranch?.name}".`);
          setIsLoading(false);
          return;
        }
      }

      if (targetBranch && (targetBranch.status === 'Deactivated' || targetBranch.status === 'Offline') && !isSuperAdminOrHO) {
        setErrorMsg(`Branch Non-Operational: "${targetBranch.name}" has been temporarily shut down or deactivated for non-operation by Head Office. Branch staff login is suspended.`);
        setIsLoading(false);
        return;
      }

      // Enforce 2FA Google Authenticator verification on all system logins
      setPendingMfaUser(matchedUser);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Failed to connect to authentication server.');
    }
  };

  // Submit MFA Challenge Verification
  const handleVerifyMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingMfaUser) return;

    setMfaErrorMsg(null);
    setIsVerifyingMfa(true);

    const secret = pendingMfaUser.mfaSecret || 'JBSWY3DPEHPK3PXP';
    const cleanInput = mfaCodeInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Check Backup Code match safely across format variations (with or without hyphens)
    let isBackupUsed = false;
    let matchedBackupCode = '';
    if (pendingMfaUser.mfaBackupCodes && pendingMfaUser.mfaBackupCodes.length > 0) {
      for (const bCode of pendingMfaUser.mfaBackupCodes) {
        if (bCode.toUpperCase().replace(/[^A-Z0-9]/g, '') === cleanInput) {
          isBackupUsed = true;
          matchedBackupCode = bCode;
          break;
        }
      }
    }

    const isValid = isBackupUsed || (await verifyTotpCode(secret, cleanInput, pendingMfaUser.mfaBackupCodes || []));
    setIsVerifyingMfa(false);

    if (!isValid) {
      setMfaErrorMsg('Invalid 6-digit Authenticator code or backup key. Please check Google Authenticator on your phone.');
      return;
    }

    const updatedUser: SystemUser = {
      ...pendingMfaUser,
      last_login: new Date().toLocaleString(),
      mfaBackupCodes: isBackupUsed 
        ? (pendingMfaUser.mfaBackupCodes || []).filter(c => c !== matchedBackupCode && c.toUpperCase().replace(/[^A-Z0-9]/g, '') !== cleanInput)
        : pendingMfaUser.mfaBackupCodes,
      authAuditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          action: isBackupUsed ? 'Emergency Backup Recovery Key Used' : '2-Factor Google Authenticator Challenge Passed',
          ipAddress: '127.0.0.1',
          device: 'Desktop Web Client'
        },
        ...(pendingMfaUser.authAuditLogs || [])
      ]
    };

    setPendingMfaUser(null);
    setMfaCodeInput('');
    onLoginSuccess(updatedUser);
  };

  // Submit Account Request to Admin Queue
  const handleAccountRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.name || !requestForm.email) {
      alert('Please fill in your name and email address.');
      return;
    }

    try {
      const branchObj = branches.find(b => b.id === requestForm.branch_id);
      await addUser({
        employee_id: `EMP-${1000 + Math.floor(Math.random() * 900)}`,
        name: requestForm.name,
        email: requestForm.email,
        phone: requestForm.phone,
        role: requestForm.role,
        branch_id: requestForm.branch_id,
        branch_name: branchObj ? branchObj.name : 'Colombo Head Office',
        status: 'Pending Approval'
      });

      setRequestSubmitted(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSubmitted(false);
        setRequestForm({
          name: '',
          email: '',
          phone: '',
          role: 'Sales Executive',
          branch_id: branches[0]?.id || 'b-ho',
          reason: ''
        });
      }, 2500);
    } catch (err) {
      alert('Failed to submit request');
    }
  };

  // Direct Account Recovery via Head Office Master Recovery Key
  const handleDirectHoBackupRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setHoBackupErrorMsg(null);
    setHoBackupSuccessMsg(null);

    const emailOrId = recoveryEmailInput.trim().toLowerCase();
    if (!emailOrId) {
      setHoBackupErrorMsg('Please enter your registered Email address or Employee ID.');
      return;
    }

    const cleanKey = hoBackupKeyInput.trim();
    if (!cleanKey) {
      setHoBackupErrorMsg('Please enter the Head Office Master Backup Recovery Key.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setHoBackupErrorMsg('New Password and Confirm Password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setHoBackupErrorMsg('New Password must be at least 6 characters long.');
      return;
    }

    try {
      // 1. Fetch latest registered users from combined dataset
      const dbUsers = await getCombinedUsers();

      // 2. Find target user with safe null/undefined checks
      const targetUser = dbUsers.find(u => 
        (u.email && u.email.toString().trim().toLowerCase() === emailOrId) ||
        (u.employee_id && u.employee_id.toString().trim().toLowerCase() === emailOrId) ||
        (u.id && u.id.toLowerCase() === emailOrId)
      );

      if (!targetUser) {
        setHoBackupErrorMsg(`No registered account found matching "${recoveryEmailInput}". Please check your email or Employee ID.`);
        return;
      }

      // 3. Fetch company settings for HO Master Backup Key with fallback
      let compSettings: any = null;
      try {
        compSettings = await fetchCompanySettings();
      } catch (err) {
        const raw = localStorage.getItem('innovista_company_settings');
        if (raw) {
          try { compSettings = JSON.parse(raw); } catch (e) {}
        }
      }

      if (!compSettings || !compSettings.ho_backup_key) {
        compSettings = INITIAL_COMPANY_SETTINGS;
      }

      const activeHoKey = (compSettings.ho_backup_key || 'HO-MASTER-EMERGENCY-2026-X89B').trim();

      if (compSettings.ho_backup_key_status === 'Deactivated') {
        setHoBackupErrorMsg('Head Office Master Backup Recovery Key is currently DEACTIVATED by Administration.');
        return;
      }

      if (cleanKey !== activeHoKey) {
        setHoBackupErrorMsg('Invalid Head Office Master Backup Recovery Key. Key verification failed.');
        return;
      }

      // 4. Master Backup Key verified! Reset credentials & unlock account
      const updatedUserObj: SystemUser = {
        ...targetUser,
        password: newPassword,
        status: 'Active',
        mustChangePassword: false,
        passwordChangedAt: new Date().toISOString()
      };

      try {
        await updateUser(targetUser.id, updatedUserObj);
      } catch (updateErr) {
        console.warn('updateUser API failed, applying local state update:', updateErr);
      }

      // Save reset password to localStorage as fallback
      try {
        const stored = JSON.parse(localStorage.getItem('innovista_registered_users') || '[]');
        const updated = [updatedUserObj, ...stored.filter((u: any) => u.id !== updatedUserObj.id && u.email !== updatedUserObj.email && u.employee_id !== updatedUserObj.employee_id)];
        localStorage.setItem('innovista_registered_users', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist reset user password to localStorage:', e);
      }

      // Clear any failed login attempts and rate limit lockouts
      const identKeys = [
        targetUser.email?.trim().toLowerCase(),
        targetUser.employee_id?.trim().toLowerCase(),
        targetUser.id?.trim().toLowerCase()
      ].filter(Boolean) as string[];

      setFailedAttempts(prev => {
        const copy = { ...prev };
        identKeys.forEach(k => delete copy[k]);
        return copy;
      });

      setLockedOutUsers(prev => {
        const copy = { ...prev };
        identKeys.forEach(k => delete copy[k]);
        return copy;
      });

      setHoBackupSuccessMsg(`✅ Account (${targetUser.name} - ${targetUser.email || targetUser.employee_id}) credentials reset & unlocked successfully via Head Office Master Recovery Key!`);

      // Auto pre-fill login inputs & operational branch
      setIdentifier(targetUser.email || targetUser.employee_id || '');
      setPassword(newPassword);
      if (targetUser.branch_id) {
        setSelectedBranchId(targetUser.branch_id);
      }

      setTimeout(() => {
        setShowRecoveryModal(false);
        setHoBackupSuccessMsg(null);
        setRecoveryEmailInput('');
        setHoBackupKeyInput('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err: any) {
      console.error('Direct HO Backup Recovery Error:', err);
      setHoBackupErrorMsg(err?.message || 'Failed to process account recovery. Please verify your inputs.');
    }
  };

  // Direct OTP / Google Authenticator Account Recovery Handlers
  const handleSendOtpForEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpErrorMsg(null);

    const emailOrId = recoveryEmailInput.trim().toLowerCase();
    if (!emailOrId) {
      setOtpErrorMsg('Please enter your account Email address or Employee ID.');
      return;
    }

    try {
      const dbUsers = await getCombinedUsers();

      const targetUser = dbUsers.find(u => 
        (u.email && u.email.toString().trim().toLowerCase() === emailOrId) ||
        (u.employee_id && u.employee_id.toString().trim().toLowerCase() === emailOrId) ||
        (u.id && u.id.toLowerCase() === emailOrId)
      );

      if (!targetUser) {
        setOtpErrorMsg(`No registered account found matching "${recoveryEmailInput}".`);
        return;
      }

      setSelectedRecoveryUser(targetUser);
      const code = generateEmailOtp();
      setSimulatedOtpCode(code);
      setRecoveryStep('otp');
    } catch (err) {
      setOtpErrorMsg('Failed to look up user account. Please try again.');
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecoveryUser) return;

    const userCodeClean = userEnteredOtp.trim().replace(/\s+/g, '');
    if (!userCodeClean) {
      setOtpErrorMsg('Please enter the 6-digit code or emergency backup key.');
      return;
    }

    // Verify 6-digit code against:
    // 1. Google Authenticator live code for selectedRecoveryUser.mfaSecret or backup keys
    // 2. Sent Email OTP code
    let isValid = false;

    if (selectedRecoveryUser.mfaSecret) {
      isValid = await verifyTotpCode(selectedRecoveryUser.mfaSecret, userCodeClean, selectedRecoveryUser.mfaBackupCodes || []);
    }

    if (!isValid && simulatedOtpCode && userCodeClean === simulatedOtpCode) {
      isValid = true;
    }

    if (!isValid) {
      setOtpErrorMsg('Invalid recovery code or backup key. Please check Google Authenticator on your phone or check your backup keys.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setOtpErrorMsg('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setOtpErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      const updatedUserObj: SystemUser = {
        ...selectedRecoveryUser,
        password: newPassword,
        status: 'Active',
        mustChangePassword: false,
        passwordChangedAt: new Date().toISOString()
      };

      try {
        await updateUser(selectedRecoveryUser.id, updatedUserObj);
      } catch (updateErr) {
        console.warn('updateUser API failed during OTP reset, applying local state update:', updateErr);
      }

      // Save reset password to localStorage as fallback
      try {
        const stored = JSON.parse(localStorage.getItem('innovista_registered_users') || '[]');
        const updated = [updatedUserObj, ...stored.filter((u: any) => u.id !== updatedUserObj.id && u.email !== updatedUserObj.email && u.employee_id !== updatedUserObj.employee_id)];
        localStorage.setItem('innovista_registered_users', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist reset user password to localStorage:', e);
      }

      // Clear any failed login attempts and rate limit lockouts
      const identKeys = [
        selectedRecoveryUser.email?.trim().toLowerCase(),
        selectedRecoveryUser.employee_id?.trim().toLowerCase(),
        selectedRecoveryUser.id?.trim().toLowerCase()
      ].filter(Boolean) as string[];

      setFailedAttempts(prev => {
        const copy = { ...prev };
        identKeys.forEach(k => delete copy[k]);
        return copy;
      });

      setLockedOutUsers(prev => {
        const copy = { ...prev };
        identKeys.forEach(k => delete copy[k]);
        return copy;
      });

      setResetSuccess(true);
      setIdentifier(selectedRecoveryUser.email || selectedRecoveryUser.employee_id || '');
      setPassword(newPassword);
      if (selectedRecoveryUser.branch_id) {
        setSelectedBranchId(selectedRecoveryUser.branch_id);
      }

      setTimeout(() => {
        setShowRecoveryModal(false);
        setResetSuccess(false);
        setRecoveryStep('email');
        setSelectedRecoveryUser(null);
        setRecoveryEmailInput('');
        setUserEnteredOtp('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err) {
      setOtpErrorMsg('Failed to reset password. Please try again.');
    }
  };

  // Mask Email Helper
  const maskEmail = (email: string) => {
    if (!email || !email.includes('@')) return email;
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.charAt(0)}***${name.charAt(name.length - 1)}@${domain}`;
  };

  const pwdStrength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen bg-white text-[#0F203C] flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#73A5CA_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Top Header Navigation Bar */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 px-6 sm:px-12 flex items-center justify-between z-10 shadow-xs">
        <CompanyLogo size="md" />
        <div className="flex items-center space-x-3">
          <span className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FEFDDF] border border-[#FFC81E]/60 text-[#0F203C] text-xs font-bold rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E87F24]" />
            <span>ERP Enterprise Portal v4.2</span>
          </span>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center space-x-1.5 bg-[#0F203C] hover:bg-[#1A2E4E] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition shadow-xs hover:shadow-md"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#FFC81E]" />
            <span>Request Account</span>
          </button>
        </div>
      </header>

      {/* Main Content Split View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
        
        {/* LEFT COLUMN: Brand Vision & Quick Presets */}
        <div className="flex-1 space-y-6 text-left max-w-xl">
          <h1 className="text-4xl sm:text-5xl font-black text-[#0F203C] leading-tight tracking-tight">
            Innovista Enterprise{' '}
            <span className="font-black bg-gradient-to-r from-[#FF4500] via-[#E87F24] to-[#FFA500] bg-clip-text text-transparent drop-shadow-xs">
              POS
            </span>{' '}
            <br />
            <span className="text-[#E87F24]">
              Management Portal
            </span>
          </h1>

          <p className="text-[#0F203C]/80 text-base leading-relaxed font-medium">
            Centralized multi-branch price engine, instant quotation compiler, inventory barcode scanner, and order tracking platform designed for staff, estimators, and branch managers.
          </p>
        </div>

        {/* RIGHT COLUMN: Styled Login Card */}
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Role Tab Selector */}
            <div>
              <label className="text-[11px] font-bold text-[#0F203C]/70 uppercase tracking-wider block mb-2">
                SELECT PORTAL ACCESS ROLE:
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#FEFDDF] rounded-xl border border-[#FFC81E]/40">
                <button
                  type="button"
                  onClick={() => setSelectedRole('Sales Executive')}
                  className={`py-2 text-xs font-bold rounded-lg transition ${
                    selectedRole === 'Sales Executive'
                      ? 'bg-[#0F203C] text-white shadow-md'
                      : 'text-[#0F203C] hover:bg-white/60'
                  }`}
                >
                  Sales Exec
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('Branch Manager')}
                  className={`py-2 text-xs font-bold rounded-lg transition ${
                    selectedRole === 'Branch Manager'
                      ? 'bg-[#0F203C] text-white shadow-md'
                      : 'text-[#0F203C] hover:bg-white/60'
                  }`}
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('Super Admin')}
                  className={`py-2 text-xs font-bold rounded-lg transition ${
                    selectedRole === 'Super Admin'
                      ? 'bg-[#0F203C] text-white shadow-md'
                      : 'text-[#0F203C] hover:bg-white/60'
                  }`}
                >
                  HO Admin
                </button>
              </div>
            </div>

            {/* Session Expired Notice Banner */}
            {sessionNotice && (
              <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl flex items-center space-x-2.5 shadow-2xs animate-fadeIn">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold">{sessionNotice}</span>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-950 text-xs rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
                <div className="pt-1.5 border-t border-amber-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-amber-800 font-medium">Locked out or forgotten login?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryTab('ho_backup_key');
                      setShowRecoveryModal(true);
                    }}
                    className="font-bold text-rose-700 hover:text-rose-900 underline flex items-center space-x-1 cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>HO Backup Key Recovery</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-[#0F203C] uppercase tracking-wider block mb-1.5">
                  TARGET BRANCH NODE LOCATION:
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#73A5CA] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#E87F24] focus:bg-white text-[#0F203C] text-xs font-semibold pl-10 pr-4 py-3 rounded-xl transition focus:ring-2 focus:ring-[#FFC81E]/30 appearance-none"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code}) {b.status === 'Deactivated' || b.status === 'Offline' ? ' - [OFFLINE/SHUTDOWN]' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#0F203C] uppercase tracking-wider block mb-1.5">
                  EMPLOYEE UNIQUE ID / EMAIL ADDRESS:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#73A5CA] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    placeholder="e.g. EMP-1001 or admin@innovistapos.lk"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#E87F24] focus:bg-white text-[#0F203C] text-xs font-semibold pl-10 pr-4 py-3 rounded-xl transition focus:ring-2 focus:ring-[#FFC81E]/30"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-[#0F203C] uppercase tracking-wider">
                    SECURE PASSPHRASE:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(true)}
                    className="text-[11px] font-bold text-[#E87F24] hover:text-[#D26E1A] underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#73A5CA] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#E87F24] focus:bg-white text-[#0F203C] text-xs font-semibold pl-10 pr-4 py-3 rounded-xl transition focus:ring-2 focus:ring-[#FFC81E]/30"
                  />
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E87F24] hover:bg-[#D26E1A] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg transition transform active:scale-98 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <span>Authenticating Credentials...</span>
                ) : (
                  <>
                    <span>SIGN IN SECURE SESSION</span>
                    <ArrowRight className="w-4 h-4 text-[#FFC81E]" />
                  </>
                )}
              </button>
            </form>

            {/* Account Creation & 2FA Signup Callout */}
            <div className="p-3.5 bg-gradient-to-br from-[#FEFDDF] to-orange-50/80 rounded-xl border border-[#FFC81E] text-center text-xs text-[#0F203C] space-y-2 shadow-2xs">
              <div className="flex items-center justify-center space-x-1.5 font-bold text-[#0F203C]">
                <QrCode className="w-4 h-4 text-[#E87F24]" />
                <span>New User Registration & 2FA Setup</span>
              </div>
              <p className="text-[11px] text-[#0F203C]/80">
                Register a new account and bind it with <strong className="text-[#E87F24]">Google Authenticator</strong> by scanning a unique QR code.
              </p>
              <button
                type="button"
                onClick={handleOpenSignupModal}
                className="w-full bg-[#0F203C] hover:bg-[#1a335c] text-white font-extrabold text-xs py-2.5 px-3 rounded-lg transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#FFC81E]" />
                <span>SIGN UP & VERIFY GOOGLE AUTHENTICATOR QR CODE</span>
              </button>
              <div className="flex items-center justify-center space-x-3 pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(true)}
                  className="font-bold text-[#E87F24] hover:underline cursor-pointer"
                >
                  Submit Admin Request
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(true)}
                  className="font-bold text-[#0F203C] hover:underline cursor-pointer"
                >
                  Forgot Email / Account Lookup
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-[#0F203C]/70 z-10">
        <p className="font-bold text-[#0F203C]">INNOVISTA ENTERPRISE POS © 2026. All Rights Reserved.</p>
        <p className="text-[11px] text-[#73A5CA] mt-0.5">Enterprise Multi-Branch Management Portal</p>
      </footer>

      {/* 2-FACTOR MULTI-FACTOR AUTHENTICATION CHALLENGE MODAL */}
      {pendingMfaUser && (
        <div className="fixed inset-0 bg-[#0F203C]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#0F203C] p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Smartphone className="w-5 h-5 text-[#FFC81E]" />
                <div>
                  <h3 className="font-bold text-base text-white">Google Authenticator Challenge</h3>
                  <p className="text-xs text-[#73A5CA]">Employee ID: <span className="font-mono font-bold text-[#FFC81E]">{pendingMfaUser.employee_id || 'EMP-VERIFIED'}</span></p>
                </div>
              </div>
              <button
                onClick={() => setPendingMfaUser(null)}
                className="p-1 hover:bg-white/20 rounded-lg text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-900">
                <span className="font-bold">2-Factor Security Enabled:</span> Welcome back, <strong>{pendingMfaUser.name}</strong>. Please enter the 6-digit code from your Google Authenticator / Authy app or emergency backup code.
              </div>

              {mfaErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{mfaErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleVerifyMfaSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase">
                    6-Digit Authenticator Code or Backup Key:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit passcode"
                    value={mfaCodeInput}
                    onChange={(e) => setMfaCodeInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#E87F24] focus:bg-white text-lg font-mono font-extrabold text-center tracking-wider p-3 rounded-xl"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPendingMfaUser(null)}
                    className="w-1/3 py-3 border border-slate-300 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingMfa || !mfaCodeInput.trim()}
                    className="w-2/3 bg-[#E87F24] hover:bg-[#D26E1A] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-lg transition"
                  >
                    {isVerifyingMfa ? 'Verifying...' : 'VERIFY & ENTER PORTAL'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST ACCOUNT ACCESS MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-[#0F203C]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#0F203C] p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <UserPlus className="w-5 h-5 text-[#FFC81E]" />
                <div>
                  <h3 className="font-bold text-base text-white">Request Account Access</h3>
                  <p className="text-xs text-[#73A5CA]">Submit details for Admin approval in User Management</p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestSubmitted ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Request Submitted to Admin Queue</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your registration request for <strong className="text-slate-900">{requestForm.email}</strong> has been sent. Your System Administrator can activate your account in User Management.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAccountRequestSubmit} className="p-6 space-y-4">
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-900 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Admin-Only Policy:</strong> System accounts can only be created and activated by authorized Administrators. Submitting this form will add your request to the Admin User Management queue.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">FULL NAME:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amara Silva"
                    value={requestForm.name}
                    onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold p-2.5 rounded-lg focus:bg-white focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">WORK EMAIL:</label>
                    <input
                      type="email"
                      required
                      placeholder="amara@innovistapos.lk"
                      value={requestForm.email}
                      onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold p-2.5 rounded-lg focus:bg-white focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">PHONE NUMBER:</label>
                    <input
                      type="text"
                      placeholder="+94 77 123 4567"
                      value={requestForm.phone}
                      onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold p-2.5 rounded-lg focus:bg-white focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">DESIRED ROLE:</label>
                    <select
                      value={requestForm.role}
                      onChange={(e) => setRequestForm({ ...requestForm, role: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold p-2.5 rounded-lg focus:bg-white focus:border-orange-500"
                    >
                      <option value="Sales Executive">Sales Executive</option>
                      <option value="Branch Manager">Branch Manager</option>
                      <option value="HO Admin">HO Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ASSIGNED BRANCH:</label>
                    <select
                      value={requestForm.branch_id}
                      onChange={(e) => setRequestForm({ ...requestForm, branch_id: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold p-2.5 rounded-lg focus:bg-white focus:border-orange-500"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-md"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FORGOT EMAIL / ACCOUNT RECOVERY MODAL */}
      {showRecoveryModal && (
        <div className="fixed inset-0 bg-[#0F203C]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#0F203C] p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Search className="w-5 h-5 text-[#FFC81E]" />
                <div>
                  <h3 className="font-bold text-base text-white">Account & Password Recovery Portal</h3>
                  <p className="text-xs text-[#73A5CA]">Recover accounts via Email OTP or HO Emergency Master Key</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRecoveryModal(false);
                  setRecoveryStep('search');
                  setSelectedRecoveryUser(null);
                  setHoBackupErrorMsg(null);
                  setHoBackupSuccessMsg(null);
                }}
                className="p-1 hover:bg-white/20 rounded-lg text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recovery Method Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100 p-1.5 gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setRecoveryTab('otp');
                  setHoBackupErrorMsg(null);
                  setHoBackupSuccessMsg(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer ${
                  recoveryTab === 'otp'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Mail className="w-4 h-4 text-orange-600" />
                <span>Email / OTP Recovery</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRecoveryTab('ho_backup_key');
                  setHoBackupErrorMsg(null);
                  setHoBackupSuccessMsg(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer ${
                  recoveryTab === 'ho_backup_key'
                    ? 'bg-white text-rose-900 shadow-xs border border-rose-200'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <KeyRound className="w-4 h-4 text-rose-600" />
                <span>HO Emergency Backup Key</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* TAB 1: HO EMERGENCY MASTER BACKUP KEY RECOVERY (PRIMARY & DIRECT) */}
              {recoveryTab === 'ho_backup_key' && (
                <form onSubmit={handleDirectHoBackupRecovery} className="space-y-4">
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 space-y-1">
                    <div className="font-bold flex items-center space-x-1.5 text-rose-700 text-sm">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>Head Office Direct Account Recovery</span>
                    </div>
                    <p className="text-[11px] text-rose-800 leading-snug">
                      Enter your account Email address and the Head Office Master Recovery Key to immediately reset your password and unlock access.
                    </p>
                  </div>

                  {hoBackupErrorMsg && (
                    <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 rounded-xl font-semibold flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{hoBackupErrorMsg}</span>
                    </div>
                  )}

                  {hoBackupSuccessMsg && (
                    <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl font-bold text-center">
                      {hoBackupSuccessMsg}
                    </div>
                  )}

                  <div>
                    <label className="font-bold text-slate-800 block mb-1 uppercase tracking-wider text-[11px]">
                      Registered Account Email or Employee ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. admin@innovistapos.lk or EMP-1001"
                      value={recoveryEmailInput}
                      onChange={(e) => setRecoveryEmailInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 font-bold text-slate-900 p-2.5 rounded-lg focus:bg-white focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1 uppercase tracking-wider text-[11px]">
                      Head Office Master Backup Recovery Key *
                    </label>
                    <div className="relative">
                      <input
                        type={showHoBackupKeySecret ? 'text' : 'password'}
                        required
                        placeholder="Enter HO Emergency Key (e.g. HO-MASTER-EMERGENCY-2026-X89B)"
                        value={hoBackupKeyInput}
                        onChange={(e) => setHoBackupKeyInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900 p-2.5 rounded-lg pr-10 focus:bg-white focus:border-rose-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowHoBackupKeySecret(!showHoBackupKeySecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showHoBackupKeySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Provided by Head Office Admin (configured in Security Settings).
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1 uppercase tracking-wider text-[11px]">New Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 font-bold p-2.5 rounded-lg focus:bg-white focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1 uppercase tracking-wider text-[11px]">Confirm Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Re-type new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 font-bold p-2.5 rounded-lg focus:bg-white focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Reset Credentials & Unlock Account</span>
                  </button>
                </form>
              )}

              {/* TAB 2: EMAIL / OTP RECOVERY */}
              {recoveryTab === 'otp' && (
                <>
                  {recoveryStep === 'email' && (
                    <form onSubmit={handleSendOtpForEmail} className="space-y-4">
                      {otpErrorMsg && (
                        <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 rounded-xl font-semibold flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <span>{otpErrorMsg}</span>
                        </div>
                      )}

                      <div>
                        <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[11px]">
                          Enter Registered Account Email or Employee ID *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. admin@innovistapos.lk or EMP-1001"
                          value={recoveryEmailInput}
                          onChange={(e) => setRecoveryEmailInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 font-bold p-2.5 rounded-lg focus:bg-white focus:border-orange-500 text-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Send 6-Digit OTP Code</span>
                      </button>
                    </form>
                  )}

                  {recoveryStep === 'otp' && selectedRecoveryUser && (
                    <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
                      {resetSuccess ? (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-center rounded-xl font-bold">
                          ✅ Password updated successfully! Redirecting to login...
                        </div>
                      ) : (
                        <>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                            Resetting password for: <strong className="font-bold">{selectedRecoveryUser.name} ({selectedRecoveryUser.email})</strong>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Authenticator & Security OTP Verification</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-normal">
                              Enter the live 6-digit code from <strong>Google Authenticator</strong> on your mobile phone, or enter an emergency 8-character backup recovery key.
                            </p>
                          </div>

                          {otpErrorMsg && (
                            <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 rounded-xl font-semibold text-xs">
                              {otpErrorMsg}
                            </div>
                          )}

                          <div>
                            <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[11px]">ENTER 6-DIGIT OTP OR BACKUP KEY *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 123456 or A9HF-4K28"
                              value={userEnteredOtp}
                              onChange={(e) => setUserEnteredOtp(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 font-mono font-bold text-center text-base p-2.5 rounded-lg focus:bg-white focus:border-orange-500 text-slate-900"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[11px]">NEW PASSWORD *</label>
                              <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 font-bold p-2.5 rounded-lg focus:bg-white focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[11px]">CONFIRM PASSWORD *</label>
                              <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 font-bold p-2.5 rounded-lg focus:bg-white focus:border-orange-500"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                          >
                            Verify & Reset Password
                          </button>
                        </>
                      )}
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* NEW USER SIGNUP & UNIQUE GOOGLE AUTHENTICATOR 2FA QR CODE MODAL */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-[#0F203C]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="bg-[#0F203C] p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#E87F24]/20 border border-[#E87F24]/40 flex items-center justify-center text-[#FFC81E]">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                    <span>Account Signup & 2FA Setup</span>
                  </h3>
                  <p className="text-xs text-[#73A5CA]">Google Authenticator Unique QR Code Binding</p>
                </div>
              </div>
              <button
                onClick={() => setShowSignupModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Indicators */}
            <div className="grid grid-cols-3 bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-center">
              <div className={`py-2 px-1 border-r border-slate-200 transition ${signupStep === 'info' ? 'bg-[#E87F24] text-white font-extrabold' : 'text-slate-500'}`}>
                1. Account Details
              </div>
              <div className={`py-2 px-1 border-r border-slate-200 transition ${signupStep === 'qr_verify' ? 'bg-[#E87F24] text-white font-extrabold' : 'text-slate-500'}`}>
                2. Scan 2FA QR Code
              </div>
              <div className={`py-2 px-1 transition ${signupStep === 'success' ? 'bg-emerald-600 text-white font-extrabold' : 'text-slate-500'}`}>
                3. Activated
              </div>
            </div>

            <div className="p-6">
              {/* Error Message Alert */}
              {signupMfaError && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{signupMfaError}</span>
                </div>
              )}

              {/* STEP 1: Account Info & Passwords */}
              {signupStep === 'info' && (
                <form onSubmit={handleSignupInfoNext} className="space-y-4 text-xs">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Fill in your profile details below. Next, you will be shown a <strong>unique Google Authenticator QR Code</strong> to scan and bind 2FA security to your new account.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">EMPLOYEE ID:</label>
                      <input
                        type="text"
                        required
                        value={signupForm.employee_id}
                        onChange={(e) => setSignupForm({ ...signupForm, employee_id: e.target.value.toUpperCase() })}
                        className="w-full bg-slate-50 border border-slate-300 font-mono font-bold text-orange-600 p-2.5 rounded-lg focus:bg-white focus:border-orange-500"
                        placeholder="EMP-1002"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">FULL NAME *:</label>
                      <input
                        type="text"
                        required
                        value={signupForm.name}
                        onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 font-semibold p-2.5 rounded-lg focus:bg-white focus:border-orange-500"
                        placeholder="e.g. Kasun Fernando"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">WORK EMAIL *:</label>
                      <input
                        type="email"
                        required
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 font-semibold p-2.5 rounded-lg focus:bg-white focus:border-orange-500"
                        placeholder="kasun@innovistapos.lk"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">PHONE NUMBER:</label>
                      <input
                        type="text"
                        value={signupForm.phone}
                        onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 font-semibold p-2.5 rounded-lg focus:bg-white focus:border-orange-500"
                        placeholder="+94 77 123 4567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">SYSTEM ROLE *:</label>
                      <select
                        value={signupForm.role}
                        onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value as any })}
                        className="w-full bg-slate-50 border border-slate-300 font-semibold p-2.5 rounded-lg focus:bg-white focus:border-orange-500"
                      >
                        <option value="Sales Executive">Sales Executive</option>
                        <option value="Branch Manager">Branch Manager</option>
                        <option value="HO Admin">HO Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">ASSIGNED BRANCH *:</label>
                      <select
                        value={signupForm.branch_id}
                        onChange={(e) => setSignupForm({ ...signupForm, branch_id: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 font-semibold p-2.5 rounded-lg focus:bg-white focus:border-orange-500"
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">CREATE PASSWORD *:</label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? "text" : "password"}
                          required
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 font-semibold p-2.5 rounded-lg pr-9 focus:bg-white focus:border-orange-500"
                          placeholder="Min 6 characters..."
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">CONFIRM PASSWORD *:</label>
                      <div className="relative">
                        <input
                          type={showSignupConfirmPassword ? "text" : "password"}
                          required
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 font-semibold p-2.5 rounded-lg pr-9 focus:bg-white focus:border-orange-500"
                          placeholder="Re-type password..."
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showSignupConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {signupForm.password && (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">Password Strength:</span>
                        <span className={`font-bold ${getPasswordStrength(signupForm.password).color.replace('bg-', 'text-')}`}>
                          {getPasswordStrength(signupForm.password).label}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getPasswordStrength(signupForm.password).color} transition-all duration-300`}
                          style={{ width: `${(getPasswordStrength(signupForm.password).score / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowSignupModal(false)}
                      className="px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#E87F24] hover:bg-[#D26E1A] text-white rounded-xl font-extrabold shadow-md transition flex items-center space-x-2 cursor-pointer"
                    >
                      <span>NEXT: SCAN 2FA QR CODE</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Unique Google Authenticator QR Code & TOTP Verification */}
              {signupStep === 'qr_verify' && (
                <form onSubmit={handleVerifySignupAndCreateAccount} className="space-y-4 text-xs">
                  {/* Instructions Banner */}
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl space-y-1">
                    <div className="font-extrabold text-xs flex items-center space-x-1.5 text-amber-950">
                      <Smartphone className="w-4 h-4 text-amber-600" />
                      <span>Bind Google Authenticator to Account ({signupForm.email}):</span>
                    </div>
                    <ol className="list-decimal list-inside text-[11px] space-y-0.5 text-amber-900 font-medium">
                      <li>Open <strong>Google Authenticator</strong> or <strong>Authy</strong> on your phone.</li>
                      <li>Tap <strong>+</strong> and choose <strong>Scan a QR Code</strong> or enter the manual key.</li>
                      <li>Scan the QR code below or enter the manual setup secret key.</li>
                      <li>Enter the current 6-digit code to complete registration.</li>
                    </ol>
                  </div>

                  {/* QR Code Container & Manual Secret Key */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-xs text-center">
                      <QRCodeSVG
                        value={generateOtpAuthUrl(signupForm.email || 'user@innovistapos.lk', signupSecret, 'InnovistaPOS')}
                        size={160}
                        level="H"
                        includeMargin={true}
                        className="mx-auto rounded-lg"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Scan with Google Authenticator</p>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Manual Setup Secret Key:
                        </label>
                        <div className="flex items-center space-x-1.5">
                          <code className="flex-1 bg-white border border-slate-300 text-slate-900 font-mono font-bold p-2 rounded-lg text-xs tracking-wider select-all">
                            {signupSecret}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopySignupSecret}
                            className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-[11px] transition cursor-pointer shrink-0"
                          >
                            {copiedSignupSecret ? 'Copied!' : 'Copy Key'}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* TOTP 6-Digit Code Verification Input */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-slate-800 block uppercase">
                      ENTER 6-DIGIT CODE FROM GOOGLE AUTHENTICATOR *:
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      placeholder="e.g. 123456"
                      value={signupTotpCode}
                      onChange={(e) => setSignupTotpCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#E87F24] focus:bg-white text-xl font-mono font-extrabold text-center tracking-widest p-3 rounded-xl shadow-inner text-slate-900"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-between border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSignupStep('info')}
                      className="px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isVerifyingSignupMfa || !signupTotpCode.trim()}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold shadow-md transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingSignupMfa ? (
                        <span>Verifying QR & Submitting...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          <span>VERIFY CODE & REGISTER</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Registration Success Confirmation & Immediate Login */}
              {signupStep === 'success' && createdSignupUser && (
                <div className="text-center space-y-4 py-2">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50 shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-slate-900">Account Activated & 2FA Bound!</h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      Your system account has been created, verified with <strong>Google Authenticator</strong>, and activated.
                    </p>
                  </div>

                  {/* Backup Recovery Keys Box */}
                  <div className="bg-slate-900 text-slate-100 rounded-2xl p-3.5 text-left space-y-2 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1">
                        <Key className="w-3.5 h-3.5" />
                        <span>Emergency Backup Recovery Keys</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCopySignupBackupCodes}
                        className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded text-[10px] transition cursor-pointer"
                      >
                        {copiedSignupBackup ? 'Copied All!' : 'Copy Keys'}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Store these emergency backup keys in a secure place. If you lose your phone or Google Authenticator, you can use any key to sign in.
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] font-bold text-emerald-400 bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                      {signupBackupCodes.map((code, idx) => (
                        <div key={idx}>{code}</div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-left space-y-1.5 text-xs">
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">Employee ID:</span>
                      <span className="font-mono font-bold text-slate-900">{createdSignupUser.employee_id}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">Full Name:</span>
                      <span className="font-bold text-slate-900">{createdSignupUser.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">Registered Email:</span>
                      <span className="font-semibold text-orange-600">{createdSignupUser.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">Assigned Branch:</span>
                      <span className="font-bold text-slate-900">{createdSignupUser.branch_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Account Status:</span>
                      <span className="font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Active & Ready</span>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier(createdSignupUser.email || createdSignupUser.employee_id || '');
                      if (signupForm.password) {
                        setPassword(signupForm.password);
                      }
                      setShowSignupModal(false);
                    }}
                    className="w-full bg-[#E87F24] hover:bg-[#D26E1A] text-white font-extrabold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>PROCEED TO LOGIN NOW</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
