"use client";

import { useEffect, useState } from 'react';

export default function DevToolsGuard() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // This completely blocks the site
    const blockSite = () => {
      setBlocked(true);
      
      // Clear everything
      try {
        localStorage.clear();
        sessionStorage.clear();
        document.body.innerHTML = ''; // Remove all content
      } catch (e) {}
    };

    // Check if DevTools is open - runs continuously
    const checkDevTools = () => {
      const start = performance.now();
      debugger;
      const end = performance.now();
      
      // If debugger paused, DevTools is open
      if (end - start > 50) {
        blockSite();
        return true;
      }
      return false;
    };

    // Check every 100ms (very frequent)
    const interval = setInterval(checkDevTools, 100);

    // Also check on blur/focus
    window.addEventListener('blur', () => {
      setTimeout(() => {
        if (checkDevTools()) {
          blockSite();
        }
      }, 50);
    });

    window.addEventListener('focus', () => {
      setTimeout(() => {
        if (checkDevTools()) {
          blockSite();
        }
      }, 50);
    });

    // Block all DevTools shortcuts
    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.metaKey && e.altKey && e.key === 'i')
      ) {
        e.preventDefault();
        blockSite();
      }
    });

    // Block right click
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      blockSite();
    });

    return () => {
      clearInterval(interval);
    };
  }, []);

  // If blocked, show nothing (complete disconnect)
  if (blocked) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#333'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️ Developer Tools Detected</h1>
          <p>Please close DevTools to continue using this site</p>
        </div>
      </div>
    );
  }

  return null;
}