import { useEffect } from 'react';

/** Controles actuales, compartidos por teclado y botones táctiles. */
export const input = {
  forward: false,
  back: false,
  left: false,
  right: false,
  boost: false,
};

export type InputKey = keyof typeof input;

const keyMap: Record<string, InputKey> = {
  ArrowUp: 'forward',
  KeyW: 'forward',
  ArrowDown: 'back',
  KeyS: 'back',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ShiftLeft: 'boost',
  ShiftRight: 'boost',
};

export function resetInput() {
  (Object.keys(input) as InputKey[]).forEach((key) => {
    input[key] = false;
  });
}

export function useKeyboardControls(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      resetInput();
      return;
    }
    const handle = (pressed: boolean) => (event: KeyboardEvent) => {
      const key = keyMap[event.code];
      if (!key) return;
      input[key] = pressed;
      if (event.code.startsWith('Arrow')) event.preventDefault();
    };
    const down = handle(true);
    const up = handle(false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', resetInput);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', resetInput);
      resetInput();
    };
  }, [enabled]);
}
