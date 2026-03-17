import React, { useState } from 'react';
import { 
  User, Phone, Lock, Check, 
  Loader2, Eye, EyeOff, Save,
  Settings as SettingsIcon, X, ChevronDown
} from 'lucide-react';

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
}

export const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Mobile Verification State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [tempMobileNumber, setTempMobileNumber] = useState('');
  const [tempCountryCode, setTempCountryCode] = useState('+91');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'enter-number' | 'enter-otp'>('enter-number');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(30);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

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

  const handleSendOtp = async () => {
    if (!tempMobileNumber || tempMobileNumber.length < 5) {
      alert('Please enter a valid mobile number');
      return;
    }
    setIsSendingOtp(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSendingOtp(false);
    setStep('enter-otp');
    startResendTimer();
    
    // Show mock OTP for testing purposes
    setTimeout(() => {
      alert(`TESTING MODE: Your mock OTP is 123456\n\n(Note: Real SMS requires a paid service like Twilio or Fast2SMS)`);
    }, 500);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsSendingOtp(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSendingOtp(false);
    startResendTimer();
    
    // Show mock OTP for testing purposes
    setTimeout(() => {
      alert(`TESTING MODE: Your mock OTP is 123456\n\n(Note: Real SMS requires a paid service like Twilio or Fast2SMS)`);
    }, 500);
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      alert('Please enter a 6-digit OTP');
      return;
    }
    
    // In testing mode, accept any 6 digit OTP, but let's enforce 123456 if we told them that
    if (otpValue !== '123456') {
      alert('Invalid OTP. Please enter 123456 for testing.');
      return;
    }

    setIsVerifyingOtp(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsVerifyingOtp(false);
    setMobileNumber(tempMobileNumber);
    setCountryCode(tempCountryCode);
    alert('Mobile number verified successfully!');
    setIsModalOpen(false);
    setStep('enter-number');
    setOtp(['', '', '', '', '', '']);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
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

        {/* Mobile Number Section */}
        <div className="p-8 rounded-[32px] bg-zinc-900 border border-white/10 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-800 rounded-2xl">
              <Phone className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter">Mobile Number</h2>
              <p className="text-sm text-zinc-400 font-medium">Verify your mobile number for wallet payments</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-2xl border border-zinc-700">
            <div className="space-y-1">
              {mobileNumber ? (
                <>
                  <p className="text-lg font-bold text-white">{countryCode} {mobileNumber}</p>
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <Check className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Verified</span>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-zinc-500">No number added</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Unverified</p>
                </>
              )}
            </div>
            <button 
              onClick={() => {
                setTempMobileNumber(mobileNumber);
                setTempCountryCode(countryCode);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-xl font-bold text-xs shadow-sm hover:bg-zinc-600 transition-all text-white"
            >
              {mobileNumber ? 'Change Number' : 'Add Number'}
            </button>
          </div>
        </div>

        {/* Modal Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative w-full max-w-md bg-zinc-900 rounded-[32px] border border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-6 top-6 p-2 hover:bg-zinc-800 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>

              <div className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                    <Phone className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter text-white">Verify Mobile Number</h3>
                </div>

                {step === 'enter-number' ? (
                  <div className="space-y-6">
                    <p className="text-zinc-400 font-medium">
                      Enter your mobile number to receive a verification OTP.
                    </p>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-300">Mobile Number</label>
                      <div className="flex gap-2">
                        <div className="relative">
                          <select
                            value={tempCountryCode}
                            onChange={(e) => setTempCountryCode(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-3.5 bg-zinc-800 border border-zinc-700 rounded-2xl text-zinc-300 font-bold outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all h-full cursor-pointer"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={`${c.country}-${c.code}`} value={c.code}>
                                {c.country} ({c.code})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <input 
                          type="tel" 
                          value={tempMobileNumber}
                          onChange={(e) => setTempMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 15))}
                          placeholder="Enter mobile number"
                          className="flex-1 px-5 py-3.5 bg-zinc-800 border border-zinc-700 rounded-2xl outline-none text-white focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold tracking-wider w-full min-w-0"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleSendOtp}
                      disabled={isSendingOtp || tempMobileNumber.length < 5}
                      className="w-full py-4 bg-white hover:bg-zinc-200 text-black rounded-2xl font-black text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                      Send OTP
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-zinc-400 font-medium">
                        We've sent a 6-digit code to
                      </p>
                      <p className="font-black text-white">{tempCountryCode} {tempMobileNumber}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between gap-2">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-14 text-center text-xl font-black bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-white"
                          />
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <button 
                          onClick={() => setStep('enter-number')}
                          className="text-xs font-bold text-indigo-400 hover:underline"
                        >
                          Change Number
                        </button>
                        <button 
                          onClick={handleResendOtp}
                          disabled={resendTimer > 0}
                          className={`text-xs font-bold transition-colors ${resendTimer > 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-zinc-300'}`}
                        >
                          {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={handleVerifyOtp}
                      disabled={isVerifyingOtp || otp.join('').length < 6}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isVerifyingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                      Verify & Update
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
