'use client';

import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';
import { useEffect, useState } from 'react';
import styles from './landing.module.css';

export default function LandingGradientBackdrop() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);

    sync();
    media.addEventListener('change', sync);

    return () => media.removeEventListener('change', sync);
  }, []);

  return (
    <div className={styles.gradientBackdrop} aria-hidden="true">
      <ShaderGradientCanvas
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: reducedMotion ? 0.42 : 1,
        }}
        pointerEvents="none"
        pixelDensity={reducedMotion ? 1 : 1.5}
        fov={45}
        lazyLoad
        threshold={0.01}
        rootMargin="200px"
        preserveDrawingBuffer={false}
        powerPreference="high-performance"
      >
        <ShaderGradient
          control="query"
          urlString="https://shadergradient.co/customize?animate=on&axesHelper=on&bgColor1=%23000000&bgColor2=%23000000&brightness=1.5&cAzimuthAngle=60&cDistance=7.1&cPolarAngle=90&cameraZoom=15.3&color1=%23ff7a33&color2=%2333a0ff&color3=%23ffc53d&destination=onCanvas&embedMode=off&envPreset=dawn&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=off&lightType=3d&pixelDensity=1&positionX=0&positionY=-0.15&positionZ=0&range=disabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=0&shader=defaults&type=sphere&uAmplitude=1.4&uDensity=1.1&uFrequency=5.5&uSpeed=0.1&uStrength=0.4&uTime=0&wireframe=false"
        />
      </ShaderGradientCanvas>
      <div className={styles.gradientMist} />
    </div>
  );
}
