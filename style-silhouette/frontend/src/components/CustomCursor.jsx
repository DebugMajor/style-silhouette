import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hoverText, setHoverText] = useState('');

  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const posRef = useRef({ mx: 0, my: 0, rx: 0, ry: 0 });

  useEffect(() => {
    // Only initialize custom cursor on devices with fine pointer (mouse)
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const onMouseMove = (e) => {
      posRef.current.mx = e.clientX;
      posRef.current.my = e.clientY;
      if (hidden) setHidden(false);
    };

    const onMouseDown = () => setClicked(true);
    const onMouseUp = () => setClicked(false);
    const onMouseLeave = () => setHidden(true);
    const onMouseEnter = () => setHidden(false);

    // Event Delegation for Hover States
    const onMouseOver = (e) => {
      const target = e.target.closest('a, button, input, select, textarea, .card, .valtero-img-frame, .btn, [role="button"]');
      if (target) {
        setHovered(true);
        if (target.classList.contains('valtero-img-frame')) {
          setHoverText('VIEW');
        } else {
          setHoverText('');
        }
      } else {
        setHovered(false);
        setHoverText('');
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    let rafId;
    const lerpFactor = 0.15;

    const animate = () => {
      const { mx, my, rx, ry } = posRef.current;

      // Update dot position instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      }

      // Lerp ring position smoothly
      const nextRx = rx + (mx - rx) * lerpFactor;
      const nextRy = ry + (my - ry) * lerpFactor;

      posRef.current.rx = nextRx;
      posRef.current.ry = nextRy;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${nextRx}px, ${nextRy}px, 0) translate(-50%, -50%) scale(${clicked ? 0.75 : hovered ? 1.6 : 1})`;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [clicked, hovered, hidden]);

  return (
    <>
      {/* Inner Precision Dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '6px',
          height: '6px',
          backgroundColor: 'var(--accent)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate3d(-100px, -100px, 0)',
          opacity: hidden ? 0 : 1,
          transition: 'opacity 0.2s ease'
        }}
      />

      {/* Outer Lerped Follower Ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: hovered && hoverText ? '54px' : '36px',
          height: hovered && hoverText ? '54px' : '36px',
          border: '1px solid var(--accent)',
          backgroundColor: hovered ? 'rgba(184, 151, 104, 0.12)' : 'transparent',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          color: 'var(--accent)',
          fontSize: '9px',
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          letterSpacing: '0.12em',
          opacity: hidden ? 0 : 1,
          transition: 'width 0.25s ease, height 0.25s ease, background-color 0.25s ease, opacity 0.2s ease',
          willChange: 'transform'
        }}
      >
        {hoverText}
      </div>
    </>
  );
}
