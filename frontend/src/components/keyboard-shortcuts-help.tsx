"use client";

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { keys: ['Alt', 'D'], description: 'Go to Dashboard' },
      { keys: ['Alt', 'F'], description: 'Go to Funds' },
      { keys: ['Alt', 'O'], description: 'Go to Documents' },
      { keys: ['Alt', 'C'], description: 'Go to Chat' },
      { keys: ['Alt', 'U'], description: 'Go to Users' },
      { keys: ['Alt', 'S'], description: 'Go to Settings' },
    ],
  },
  {
    category: 'Actions',
    items: [
      { keys: ['Ctrl', 'K'], description: 'Focus search' },
      { keys: ['Ctrl', '/'], description: 'Show shortcuts' },
      { keys: ['Esc'], description: 'Close dialog' },
    ],
  },
];

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleShow = () => setOpen(true);
    window.addEventListener('show-shortcuts-help', handleShow);
    return () => window.removeEventListener('show-shortcuts-help', handleShow);
  }, []);

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? 'Cmd' : 'Ctrl';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate and interact faster
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                  >
                    <span className="text-sm">{item.description}</span>
                    <div className="flex gap-1">
                      {item.keys.map((key, i) => (
                        <kbd
                          key={i}
                          className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded"
                        >
                          {key === 'Ctrl' ? modKey : key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          Press <kbd className="px-2 py-1 bg-muted border rounded">Esc</kbd> to close
        </div>
      </DialogContent>
    </Dialog>
  );
}
