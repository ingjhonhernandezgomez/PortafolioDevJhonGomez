import type { ReactNode } from 'react';
import type { MeshProps } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

type MaterialProps = {
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  /** Facetas planas (estilo low-poly). Por defecto las superficies son suaves. */
  flat?: boolean;
  /** Barniz tipo pintura de carro. */
  clearcoat?: number;
  /** Brillo suave de tela o pelaje (0 a 1). */
  sheen?: number;
  sheenColor?: string;
  transparent?: boolean;
  opacity?: number;
};

const materialKeys = ['color', 'emissive', 'emissiveIntensity', 'metalness', 'roughness', 'flat', 'clearcoat', 'sheen', 'sheenColor', 'transparent', 'opacity'] as const;

/** Separa las props del material de las de la malla. */
function splitMaterial<T extends MaterialProps>(props: T) {
  const material = {} as MaterialProps;
  const mesh = { ...props } as Record<string, unknown>;
  for (const key of materialKeys) {
    if (key in mesh) {
      (material as Record<string, unknown>)[key] = mesh[key];
      delete mesh[key];
    }
  }
  return { material, mesh: mesh as Omit<T, keyof MaterialProps> };
}

function Material({
  color,
  emissive = '#000000',
  emissiveIntensity = 1,
  metalness = 0,
  roughness = 0.75,
  flat = false,
  clearcoat,
  sheen,
  sheenColor,
  transparent,
  opacity,
}: MaterialProps) {
  const shared = { color, emissive, emissiveIntensity, metalness, roughness, flatShading: flat, transparent, opacity };
  if (clearcoat || sheen) {
    return (
      <meshPhysicalMaterial
        {...shared}
        clearcoat={clearcoat ?? 0}
        clearcoatRoughness={0.08}
        sheen={sheen ?? 0}
        sheenColor={sheenColor ?? '#ffffff'}
        sheenRoughness={0.55}
      />
    );
  }
  return <meshStandardMaterial {...shared} />;
}

type PartProps = MeshProps &
  MaterialProps & {
    children: ReactNode;
    shadow?: boolean;
  };

/** Malla con material estándar; la geometría va como hijo. */
export function Part({ children, shadow = true, ...props }: PartProps) {
  const { material, mesh } = splitMaterial(props);
  return (
    <mesh castShadow={shadow} receiveShadow {...mesh}>
      {children}
      <Material {...material} />
    </mesh>
  );
}

type BoxProps = Omit<PartProps, 'children'> & { size: [number, number, number] };

export function Box({ size, ...props }: BoxProps) {
  return (
    <Part {...props}>
      <boxGeometry args={size} />
    </Part>
  );
}

type RoundProps = Omit<PartProps, 'children' | 'args'> & {
  size: [number, number, number];
  /** Radio del borde redondeado. */
  radius?: number;
};

/** Caja con bordes redondeados: quita el aspecto "cuadrado". */
export function Round({ size, radius = 0.08, shadow = true, ...props }: RoundProps) {
  const { material, mesh } = splitMaterial(props);
  const safeRadius = Math.min(radius, ...size.map((side) => side / 2 - 0.001));
  return (
    <RoundedBox args={size} radius={safeRadius} smoothness={4} castShadow={shadow} receiveShadow {...mesh}>
      <Material {...material} />
    </RoundedBox>
  );
}

/** Cápsula orientada en Y (patas, brazos, tubos). */
export function Capsule({ radius, length, ...props }: Omit<PartProps, 'children'> & { radius: number; length: number }) {
  return (
    <Part {...props}>
      <capsuleGeometry args={[radius, length, 8, 16]} />
    </Part>
  );
}

/** Esfera suave, opcionalmente estirada con `scale` para formar cuerpos orgánicos. */
export function Ball({ radius, ...props }: Omit<PartProps, 'children'> & { radius: number }) {
  return (
    <Part {...props}>
      <sphereGeometry args={[radius, 24, 18]} />
    </Part>
  );
}
