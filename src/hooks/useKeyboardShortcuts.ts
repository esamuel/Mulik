import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description?: string;
  disabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  disableInInputs?: boolean;
  preventDefault?: boolean;
}

const useKeyboardShortcuts = ({
  shortcuts,
  disableInInputs = true,
  preventDefault = true
}: UseKeyboardShortcutsOptions) => {
  
  const isInputElement = useCallback((element: Element): boolean => {
    const tagName = element.tagName.toLowerCase();
    const inputTypes = ['input', 'textarea', 'select'];
    const isContentEditable = element.getAttribute('contenteditable') === 'true';
    
    return inputTypes.includes(tagName) || isContentEditable;
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if disabled in inputs and currently focused on an input
    if (disableInInputs && event.target && isInputElement(event.target as Element)) {
      return;
    }

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      if (shortcut.disabled) return false;
      
      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const altMatches = !!shortcut.altKey === event.altKey;
      const metaMatches = !!shortcut.metaKey === event.metaKey;
      
      return keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches;
    });

    if (matchingShortcut) {
      if (preventDefault) {
        event.preventDefault();
      }
      matchingShortcut.action();
    }
  }, [shortcuts, disableInInputs, preventDefault, isInputElement]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcuts: shortcuts.filter(s => !s.disabled)
  };
};

// Predefined common shortcuts
export const createCommonShortcuts = (actions: {
  onEscape?: () => void;
  onSpace?: () => void;
  onEnter?: () => void;
  onReady?: () => void;
  onHelp?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [];

  if (actions.onEscape) {
    shortcuts.push({
      key: 'Escape',
      action: actions.onEscape,
      description: 'Close modal or go back'
    });
  }

  if (actions.onSpace) {
    shortcuts.push({
      key: ' ',
      action: actions.onSpace,
      description: 'Play/pause timer'
    });
  }

  if (actions.onEnter) {
    shortcuts.push({
      key: 'Enter',
      action: actions.onEnter,
      description: 'Confirm action'
    });
  }

  if (actions.onReady) {
    shortcuts.push({
      key: 'r',
      action: actions.onReady,
      description: 'Toggle ready status'
    });
  }

  if (actions.onHelp) {
    shortcuts.push({
      key: '?',
      shiftKey: true,
      action: actions.onHelp,
      description: 'Show help'
    });
  }

  return shortcuts;
};

export default useKeyboardShortcuts;
