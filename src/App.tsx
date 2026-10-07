import { lazy, Suspense, useState } from 'react';
import QuickSite from './QuickSite';

// El mundo 3D se carga aparte para que el modo rápido no descargue Three.js.
const World = lazy(() => import('./world/World'));

type Mode = 'mundo' | 'rapido';

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function initialMode(): Mode {
  if (window.location.hash === '#rapido') return 'rapido';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'rapido';
  return supportsWebGL() ? 'mundo' : 'rapido';
}

function App() {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [canUseWorld] = useState(supportsWebGL);

  if (mode === 'rapido') {
    return <QuickSite onOpenWorld={canUseWorld ? () => setMode('mundo') : undefined} />;
  }

  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#0d0b1e]" />}>
      <World onQuickMode={() => setMode('rapido')} />
    </Suspense>
  );
}

export default App;
