import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function SosButton({ holdDurationSeconds = 3, onActivated }) {
  const { t } = useLanguage();
  const { triggerSOS, activeEmergency } = useEmergency();
  
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [countdown, setCountdown] = useState(holdDurationSeconds);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const startPress = (e) => {
    // Prevent context menu or scroll on touch
    if (e && e.type === 'touchstart') {
      // Allow default only if not interfering
    }
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
          boxShadow: activeEmergency ? '0 0 50px rgba(220, 38, 38, 0.8)' : isPressing ? '0 0 60px rgba(220, 38, 38, 0.9)' : '0 10px 40px rgba(220, 38, 38, 0.35)',
          animation: activeEmergency ? 'pulseEmergency 1.4s infinite' : 'none',
          transform: isPressing ? 'scale(0.97)' : 'scale(1)',
          transition: 'transform 0.1s ease, box-shadow 0.2s ease'
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
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Active animated progress ring */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            stroke="#ffffff"
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 40ms linear' }}
          />
        </svg>

        {/* Center Glowing SOS Core */}
        <div style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: activeEmergency 
            ? 'linear-gradient(135deg, #ef4444 0%, #7f1d1d 100%)' 
            : isPressing 
            ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' 
            : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: 'inset 0 4px 15px rgba(255, 255, 255, 0.3)',
          textAlign: 'center',
          padding: '15px'
        }}>
          {activeEmergency ? (
            <>
              <ShieldAlert size={48} style={{ marginBottom: '6px' }} />
              <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.05em' }}>SOS ACTIVE</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Alert Dispatched</span>
            </>
          ) : isPressing ? (
            <>
              <span style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1 }}>{countdown}</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase' }}>
                {t('sos_release_cancel')}
              </span>
            </>
          ) : (
            <>
              <AlertCircle size={44} style={{ marginBottom: '6px' }} />
              <span style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '0.08em', lineHeight: 1 }}>SOS</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '6px', opacity: 0.9 }}>
                {t('sos_press_hold')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Helpful Hint Subtitle */}
      <div style={{ marginTop: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        {isPressing ? (
          <span style={{ color: '#ef4444', fontWeight: 700 }}>Holding... Keep pressing for {countdown}s</span>
        ) : (
          <span>Press & hold for 3 seconds • Or hold Spacebar</span>
        )}
      </div>
    </div>
  );
}
