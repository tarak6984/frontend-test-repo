import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + K: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      }

      // Ctrl/Cmd + /: Show keyboard shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        // Trigger help modal (we'll add this)
        window.dispatchEvent(new CustomEvent('show-shortcuts-help'));
      }

      // Escape: Close modals/dialogs
      if (e.key === 'Escape') {
        const closeButtons = document.querySelectorAll('[role="dialog"] button[aria-label*="Close"]');
        if (closeButtons.length > 0) {
          (closeButtons[0] as HTMLButtonElement).click();
        }
      }

      // Navigation shortcuts
      if (e.altKey) {
        switch (e.key) {
          case 'd':
            e.preventDefault();
            router.push('/');
            break;
          case 'f':
            e.preventDefault();
            router.push('/funds');
            break;
          case 'c':
            e.preventDefault();
            router.push('/chat');
            break;
          case 'u':
            e.preventDefault();
            router.push('/users');
            break;
          case 'o':
            e.preventDefault();
            router.push('/documents');
            break;
          case 's':
            e.preventDefault();
            router.push('/settings');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);
}
