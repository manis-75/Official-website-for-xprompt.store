import React, { useState } from 'react';
import { 
  User, Lock, 
  Loader2, Eye, EyeOff, Save,
  Settings as SettingsIcon
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const COUNTRY_CODES = [
  { code: '+971', country: 'AE' }, { code: '+54', country: 'AR' }, { code: '+43', country: 'AT' },
  { code: '+61', country: 'AU' }, { code: '+880', country: 'BD' }, { code: '+32', country: 'BE' },
  { code: '+55', country: 'BR' }, { code: '+1', country: 'CA' }, { code: '+41', country: 'CH' },
  { code: '+56', country: 'CL' }, { code: '+86', country: 'CN' }, { code: '+57', country: 'CO' },
  { code: '+49', country: 'DE' }, { code: '+45', country: 'DK' }, { code: '+20', country: 'EG' },
  { code: '+34', country: 'ES' }, { code: '+358', country: 'FI' }, { code: '+33', country: 'FR' },
  { code: '+44', country: 'GB' }, { code: '+62', country: 'ID' }, { code: '+353', country: 'IE' },
  { code: '+91', country: 'IN' }, { code: '+39', country: 'IT' }, { code: '+81', country: 'JP' },
  { code: '+254', country: 'KE' }, { code: '+82', country: 'KR' }, { code: '+94', country: 'LK' },
  { code: '+95', country: 'MM' }, { code: '+52', country: 'MX' }, { code: '+60', country: 'MY' },
  { code: '+234', country: 'NG' }, { code: '+31', country: 'NL' }, { code: '+47', country: 'NO' },
  { code: '+977', country: 'NP' }, { code: '+64', country: 'NZ' }, { code: '+51', country: 'PE' },
  { code: '+63', country: 'PH' }, { code: '+92', country: 'PK' }, { code: '+48', country: 'PL' },
  { code: '+351', country: 'PT' }, { code: '+7', country: 'RU' }, { code: '+966', country: 'SA' },
  { code: '+46', country: 'SE' }, { code: '+65', country: 'SG' }, { code: '+66', country: 'TH' },
  { code: '+90', country: 'TR' }, { code: '+1', country: 'US' }, { code: '+58', country: 'VE' },
  { code: '+84', country: 'VN' }, { code: '+27', country: 'ZA' }
].sort((a, b) => a.country.localeCompare(b.country));

interface SettingsProps {
  user: any;
  onUpdateUser?: (data: any) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSavingProfile(false);
    alert('Profile updated successfully!');
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsChangingPassword(false);
    alert('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 custom-scrollbar bg-black text-white">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/10 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-indigo-500" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">Settings</h1>
          </div>
          <p className="text-zinc-400 font-medium">Manage your account settings</p>
        </div>

        {/* Profile Section */}
        <div className="p-8 rounded-[32px] bg-zinc-900 border border-white/10 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-800 rounded-2xl">
              <User className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter">Profile</h2>
              <p className="text-sm text-zinc-400 font-medium">Update your personal information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300">Email</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                readOnly 
                className="w-full px-5 py-3.5 bg-zinc-800 border border-zinc-700 rounded-2xl outline-none text-zinc-400 cursor-not-allowed"
              />
              <p className="text-[11px] font-medium text-zinc-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300">Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-5 py-3.5 bg-zinc-800 border border-zinc-700 rounded-2xl outline-none text-white focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="pt-2">
              <p className="text-xs font-medium text-zinc-500 mb-4">Member since 3/1/2026</p>
              <button 
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-800 border border-zinc-700 rounded-xl font-bold text-sm shadow-sm hover:bg-zinc-700 transition-all active:scale-95 text-white"
              >
                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Section */}

        {/* Change Password Section */}
        <div className="p-8 rounded-[32px] bg-zinc-900 border border-white/10 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-800 rounded-2xl">
              <Lock className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter">Change Password</h2>
              <p className="text-sm text-zinc-400 font-medium">Update your account password</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300">Current Password</label>
              <div className="relative">
                <input 
                  type={showCurrentPassword ? "text" : "password"} 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-zinc-800 border border-zinc-700 rounded-2xl outline-none text-white focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
                <button 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-5 py-3.5 bg-zinc-800 border border-zinc-700 rounded-2xl outline-none text-white focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-5 py-3.5 bg-zinc-800 border border-zinc-700 rounded-2xl outline-none text-white focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="pt-2">
              <button 
                onClick={handleChangePassword}
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-800 border border-zinc-700 rounded-xl font-bold text-sm shadow-sm hover:bg-zinc-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Change Password
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
