import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export function SosButton({ holdDurationSeconds = 3, onActivated }) {
  const { t } = useLanguage();
  const { triggerSOS, activeEmergency } = useEmergency();
  
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [countdown, setCountdown] = useState(holdDurationSeconds);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const startPress = (e) => {
    if (activeEmergency) return;

    setIsPressing(true);
    setProgress(0);
    setCountdown(holdDurationSeconds);
    startTimeRef.current = Date.now();

    // Haptic feedback start
    if ('vibrate' in navigator) {
      navigator.vibrate(60);
    }

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const pct = Math.min(100, (elapsed / holdDurationSeconds) * 100);
      const remaining = Math.max(0, Math.ceil(holdDurationSeconds - elapsed));
      
      setProgress(pct);
      setCountdown(remaining);

      // Periodic haptic tick
      if ('vibrate' in navigator && Math.floor(pct) % 30 === 0) {
        navigator.vibrate(40);
      }

      if (pct >= 100) {
        clearInterval(timerRef.current);
        triggerActivation();
      }
    }, 40);
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsPressing(false);
    setProgress(0);
    setCountdown(holdDurationSeconds);
  };

  const triggerActivation = async () => {
    setIsPressing(false);
    setProgress(100);
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 300]);
    }
    const res = await triggerSOS('thumb_press');
    if (onActivated) onActivated(res);
  };

  // Keyboard accessibility: Hold Spacebar or Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.key === 'Enter') && !isPressing && !activeEmergency) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          startPress();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        if (isPressing) {
          cancelPress();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPressing, activeEmergency]);

  const radius = 105;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Emergency SOS Press and Hold Trigger"
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchCancel={cancelPress}
        style={{
          position: 'relative',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: activeEmergency ? 'default' : 'pointer',
          outline: 'none',
          boxShadow: activeEmergency 
            ? '0 0 0 8px rgba(229, 57, 69, 0.2), 0 10px 25px rgba(229, 57, 69, 0.3)' 
            : isPressing 
            ? '0 0 0 10px rgba(229, 57, 69, 0.25), 0 8px 20px rgba(229, 57, 69, 0.3)' 
            : '0 8px 24px rgba(229, 57, 69, 0.25)',
          transform: isPressing ? 'scale(0.97)' : 'scale(1)',
          transition: 'transform 0.15s ease, box-shadow 0.2s ease',
          background: '#FFFFFF'
        }}
      >
        {/* Circular Progress SVG Ring */}
        <svg
          width="260"
          height="260"
          style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        >
          {/* Background track circle */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            stroke="#E2E8F0"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Active animated progress ring */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            stroke="#E53945"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 40ms linear' }}
          />
        </svg>

        {/* Center Prominent Red SOS Core */}
        <div style={{
          width: '196px',
          height: '196px',
          borderRadius: '50%',
          background: activeEmergency 
            ? '#B91C1C' 
            : isPressing 
            ? '#CC2935' 
            : '#E53945',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          textAlign: 'center',
          padding: '16px',
          boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.15)'
        }}>
          {activeEmergency ? (
            <>
              <ShieldAlert size={44} style={{ marginBottom: '6px' }} />
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.04em' }}>SOS ACTIVE</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.95 }}>Broadcast Sent</span>
            </>
          ) : isPressing ? (
            <>
              <span style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1 }}>{countdown}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {t('sos_release_cancel')}
              </span>
            </>
          ) : (
            <>
              <AlertCircle size={40} style={{ marginBottom: '6px' }} />
              <span style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '0.06em', lineHeight: 1 }}>SOS</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, marginTop: '6px', letterSpacing: '0.02em', lineHeight: 1.2 }}>
                PRESS & HOLD TO SEND SOS
              </span>
            </>
          )}
        </div>
      </div>

      {/* Helpful Hint Subtitle */}
      <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        {isPressing ? (
          <span style={{ color: '#E53945', fontWeight: 700 }}>
            Activating SOS in {countdown}s • Release to cancel
          </span>
        ) : (
          <span>Hold for 3 seconds to activate • Or hold Spacebar</span>
        )}
      </div>
    </div>
  );
}
