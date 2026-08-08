import React, { useState, useEffect } from 'react';

interface CompanyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'white';
  logoUrl?: string;
  companyName?: string;
  tagline?: string;
}

// Signature POS Badge Icon Component matching exact brand design
export const PosLogoBadgeIcon: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string; logoUrl?: string }> = ({ 
  size = 'md',
  className = '',
  logoUrl: propLogoUrl
}) => {
  const [imageError, setImageError] = useState(false);
  const [badgeLogoUrl, setBadgeLogoUrl] = useState<string>('');

  useEffect(() => {
    const checkLogo = async () => {
      if (propLogoUrl) {
        setBadgeLogoUrl(propLogoUrl);
        return;
      }
      try {
        const stored = localStorage.getItem('innovista_company_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.logo_url) {
            setBadgeLogoUrl(parsed.logo_url);
            return;
          }
        }
      } catch (e) {
        // Ignore
      }

      try {
        const res = await fetch('/api/company-settings');
        if (res.ok) {
          const data = await res.json();
          if (data?.logo_url) {
            setBadgeLogoUrl(data.logo_url);
          }
        }
      } catch (e) {
        // Ignore
      }
    };

    checkLogo();
    window.addEventListener('innovista_company_settings_changed', checkLogo);
    return () => {
      window.removeEventListener('innovista_company_settings_changed', checkLogo);
    };
  }, [propLogoUrl]);

  const containerSizes = {
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-lg',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-18 h-18 text-3xl'
  };

  const vectorContainerSizes = {
    sm: 'px-2 py-1 min-w-[48px] h-8 text-sm',
    md: 'px-3 py-1.5 min-w-[64px] h-10 text-lg',
    lg: 'px-4 py-2 min-w-[84px] h-13 text-2xl',
    xl: 'px-5 py-2.5 min-w-[108px] h-16 text-3xl'
  };

  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
    xl: 'w-2.5 h-2.5'
  };

  if (badgeLogoUrl && !imageError) {
    return (
      <div className={`relative inline-flex items-center justify-center bg-white border border-[#FDBA74]/50 rounded-xl shadow-xs overflow-hidden select-none p-1 shrink-0 ${containerSizes[size]} ${className}`}>
        <img
          src={badgeLogoUrl}
          alt="POS Logo"
          onError={() => setImageError(true)}
          className="w-full h-full object-contain rounded-lg"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center bg-[#FEF9F2] border border-[#FDBA74]/50 rounded-xl shadow-xs select-none ${vectorContainerSizes[size]} ${className}`}>
      {/* 4 Accent Dots framing POS mark */}
      <span className={`absolute top-1 left-2 bg-[#73A5CA] rounded-xs ${dotSizes[size]}`} />
      <span className={`absolute top-1 right-2 bg-[#73A5CA] rounded-xs ${dotSizes[size]}`} />
      <span className={`absolute bottom-1 left-2 bg-[#73A5CA] rounded-xs ${dotSizes[size]}`} />
      <span className={`absolute bottom-1 right-2 bg-[#73A5CA] rounded-xs ${dotSizes[size]}`} />

      {/* Large Bold POS Text */}
      <span className="font-black tracking-tight text-[#E87F24] leading-none drop-shadow-2xs">
        POS
      </span>
    </div>
  );
};

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'full',
  logoUrl: propLogoUrl,
  companyName: propCompanyName,
  tagline: propTagline
}) => {
  const [imageError, setImageError] = useState(false);
  const [savedSettings, setSavedSettings] = useState<{
    logo_url?: string;
    company_name?: string;
    tagline?: string;
  } | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      let loadedFromLocal = false;
      try {
        const stored = localStorage.getItem('innovista_company_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          setSavedSettings(parsed);
          if (parsed && parsed.logo_url) {
            loadedFromLocal = true;
          }
        }
      } catch (e) {
        // Ignore parse error
      }

      if (!loadedFromLocal) {
        try {
          const res = await fetch('/api/company-settings');
          if (res.ok) {
            const data = await res.json();
            if (data) {
              setSavedSettings(data);
              localStorage.setItem('innovista_company_settings', JSON.stringify(data));
            }
          }
        } catch (e) {
          // Ignore
        }
      }
    };

    loadSettings();
    window.addEventListener('innovista_company_settings_changed', loadSettings);
    return () => {
      window.removeEventListener('innovista_company_settings_changed', loadSettings);
    };
  }, []);

  const effectiveLogoUrl = propLogoUrl ?? savedSettings?.logo_url ?? '/src/assets/images/pos_logo_banner_1786169189051.jpg';
  const effectiveCompanyName = propCompanyName ?? savedSettings?.company_name ?? 'INNOVISTA';
  const effectiveTagline = propTagline ?? savedSettings?.tagline ?? 'Enterprise Management System';

  // Reset image error if logoUrl changes
  useEffect(() => {
    setImageError(false);
  }, [effectiveLogoUrl]);

  const logoImgHeights = {
    sm: 'max-h-8 max-w-[140px]',
    md: 'max-h-11 max-w-[200px]',
    lg: 'max-h-14 max-w-[280px]',
    xl: 'max-h-20 max-w-[360px]'
  };

  const textSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl'
  };

  const posTextSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-4xl sm:text-5xl'
  };

  const subTextSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px] sm:text-[11px]',
    lg: 'text-[11px] sm:text-xs',
    xl: 'text-xs sm:text-sm'
  };

  // Render uploaded image logo if available and not errored
  if (effectiveLogoUrl && !imageError) {
    return (
      <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
        <img
          src={effectiveLogoUrl}
          alt={effectiveCompanyName}
          onError={() => setImageError(true)}
          className={`${logoImgHeights[size]} object-contain shrink-0 transition-transform duration-200 hover:scale-105 rounded-lg`}
          referrerPolicy="no-referrer"
        />
        {variant !== 'compact' && (
          <div className="flex flex-col justify-center min-w-0">
            <div className={`font-black tracking-tight leading-none whitespace-nowrap flex items-baseline space-x-1.5 ${variant === 'white' ? 'text-white' : 'text-[#0F203C]'}`}>
              <span className={textSizes[size]}>{effectiveCompanyName}</span>
              <span className={`text-[#E87F24] font-black tracking-tight ${posTextSizes[size]}`}>
                POS
              </span>
            </div>
            {effectiveTagline && (
              <span className={`font-semibold tracking-wider uppercase whitespace-nowrap truncate ${subTextSizes[size]} ${variant === 'white' ? 'text-slate-300' : 'text-[#73A5CA]'} mt-0.5`}>
                {effectiveTagline}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Fallback to Signature POS Brand Logo Badge & Typography
  return (
    <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
      {/* Signature POS Logo Badge with 4 Dots */}
      <PosLogoBadgeIcon size={size} logoUrl={effectiveLogoUrl} />

      {/* Brand Name with Dark Blue & Large Bold Orange POS */}
      {variant !== 'compact' && (
        <div className="flex flex-col justify-center min-w-0">
          <div className={`font-black tracking-tight leading-none whitespace-nowrap flex items-baseline space-x-1.5 ${variant === 'white' ? 'text-white' : 'text-[#0F203C]'}`}>
            <span className={textSizes[size]}>INNOVISTA</span>
            <span className={`text-[#E87F24] font-black tracking-tight ${posTextSizes[size]}`}>
              POS
            </span>
          </div>
          <span className={`font-bold tracking-wider uppercase whitespace-nowrap ${subTextSizes[size]} ${variant === 'white' ? 'text-slate-300' : 'text-[#73A5CA]'} mt-1`}>
            {effectiveTagline}
          </span>
        </div>
      )}
    </div>
  );
};
