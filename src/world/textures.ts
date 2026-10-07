import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { RepeatWrapping, SRGBColorSpace, type Texture } from 'three';

/** Texturas PBR de Poly Haven (CC0) en resolución 1K. */
export type Surface = 'aerial_grass_rock' | 'asphalt_02' | 'concrete_floor_02';

const base = `${import.meta.env.BASE_URL}textures/`;
const urls = (surface: Surface) => [`${base}${surface}_diffuse.jpg`, `${base}${surface}_nor_gl.jpg`, `${base}${surface}_rough.jpg`];

/** Color, relieve y rugosidad de una superficie, repetidos `x` por `y` veces. */
export function useSurface(surface: Surface, x: number, y: number) {
  const [color, normal, rough] = useTexture(urls(surface)) as Texture[];
  return useMemo(() => {
    const [map, normalMap, roughnessMap] = [color, normal, rough].map((texture) => {
      const copy = texture.clone();
      copy.wrapS = copy.wrapT = RepeatWrapping;
      copy.repeat.set(x, y);
      copy.anisotropy = 8;
      copy.needsUpdate = true;
      return copy;
    });
    map.colorSpace = SRGBColorSpace;
    return { map, normalMap, roughnessMap };
  }, [color, normal, rough, x, y]);
}

(['aerial_grass_rock', 'asphalt_02', 'concrete_floor_02'] as Surface[]).forEach((surface) => useTexture.preload(urls(surface)));
