import React, { useState } from 'react';
import { PortalTheme } from '../types';

interface TherapyHubLogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: PortalTheme;
  showSubtitle?: boolean;
}

export const TherapyHubLogo: React.FC<TherapyHubLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  theme = 'executive',
  showSubtitle = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const isLight = theme === 'clinical-light';

  // Height mappings based on size
  const imgHeightClass =
    size === 'sm'
      ? 'h-8'
      : size === 'md'
      ? 'h-11'
      : size === 'lg'
      ? 'h-16'
      : 'h-20';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Official Therapy Hub Logo Image */}
      {!imgError ? (
        <div
          className={`relative rounded-xl overflow-hidden shadow-md flex items-center justify-center transition-transform hover:scale-[1.02] ${
            isLight
              ? 'bg-white p-1 border border-slate-200'
              : 'bg-white/95 p-1 border border-white/20'
          }`}
        >
          <img
            src="/therapy-hub-logo.jpg"
            alt="Therapy Hub - All Therapies Under One Roof"
            referrerPolicy="no-referrer"
            className={`${imgHeightClass} w-auto object-contain rounded-lg`}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        /* Crisp High-Fidelity Vector Fallback if image fails to load */
        <div className="flex flex-col items-center">
          <div className="bg-[#0e2172] text-white px-3 py-1 rounded-full border border-blue-400/40 shadow-md flex flex-col items-center">
            {/* Colorful Arches Silhouette */}
            <div className="flex items-end justify-center gap-1 my-0.5">
              <span className="w-2.5 h-3 bg-emerald-400 rounded-t-sm" />
              <span className="w-3 h-4 bg-amber-400 rounded-t-sm" />
              <span className="w-3.5 h-5 bg-orange-500 rounded-t-sm" />
              <span className="w-3 h-4 bg-rose-500 rounded-t-sm" />
              <span className="w-2.5 h-3 bg-fuchsia-500 rounded-t-sm" />
            </div>
            <span className="text-[9px] font-extrabold tracking-tight text-[#ff7a38] uppercase">
              All Therapies Under One Roof
            </span>
          </div>
          <span className="font-black text-sm tracking-wider text-[#0e3b20] mt-0.5">
            THERAPY HUB
          </span>
        </div>
      )}

      {/* Optional Side Label / Subtitle for wider header views */}
      {variant === 'full' && showSubtitle && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight text-sm uppercase ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Therapy Hub
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              PECHS
            </span>
          </div>
          <span
            className={`text-[10px] font-semibold tracking-wide ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            All Therapies Under One Roof
          </span>
        </div>
      )}
    </div>
  );
};
