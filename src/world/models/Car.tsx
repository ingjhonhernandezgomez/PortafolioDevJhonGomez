import { useMemo } from 'react';
import type { GroupProps } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Box3, CanvasTexture, Vector3, type Mesh, type MeshStandardMaterial, type Texture } from 'three';

/** Hatchback del Car Kit de Kenney (CC0), pintado del gris del Kia Rio de Jhon. */
export const CAR_URL = `${import.meta.env.BASE_URL}models/hatchback-sports.glb`;

/** Largo real de un Kia Rio hatchback, en unidades del mundo (≈ metros). */
const TARGET_LENGTH = 4.05;
/** Gris del Kia Rio en valores de pantalla (sRGB). */
const KIA_GRAY = [140, 145, 152];

/** Copia la paleta del modelo reemplazando los tonos verdes de la pintura por gris. */
function repaint(texture: Texture) {
  const image = texture.image as HTMLImageElement | ImageBitmap;
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return texture;
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = pixels.data;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (g > r + 25 && g > b + 15) {
      // Conserva la luz y sombra original del tono, pero en gris.
      const light = (r + g + b) / 3 / 140;
      data[i] = Math.min(255, KIA_GRAY[0] * light);
      data[i + 1] = Math.min(255, KIA_GRAY[1] * light);
      data[i + 2] = Math.min(255, KIA_GRAY[2] * light);
    }
  }
  ctx.putImageData(pixels, 0, 0);
  const result = new CanvasTexture(canvas);
  result.colorSpace = texture.colorSpace;
  result.flipY = texture.flipY;
  result.magFilter = texture.magFilter;
  result.minFilter = texture.minFilter;
  return result;
}

export function Car(props: GroupProps) {
  const { scene } = useGLTF(CAR_URL);

  const { model, scale, offsetY } = useMemo(() => {
    const model = scene.clone(true);
    model.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      // La carrocería toma su color de una paleta: se cambia el verde por gris metalizado.
      if (mesh.name === 'body' || mesh.parent?.name === 'body') {
        const material = (mesh.material as MeshStandardMaterial).clone();
        if (material.map) material.map = repaint(material.map);
        material.metalness = 0.5;
        material.roughness = 0.35;
        mesh.material = material;
      }
    });
    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3());
    const scale = TARGET_LENGTH / Math.max(size.x, size.z);
    return { model, scale, offsetY: -box.min.y * scale };
  }, [scene]);

  return (
    <group {...props}>
      <primitive object={model} scale={scale} position={[0, offsetY, 0]} />
    </group>
  );
}

useGLTF.preload(CAR_URL);
