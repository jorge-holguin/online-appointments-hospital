"use client"

import { useCallback, useEffect, useState, memo } from "react"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import type { Container, ISourceOptions } from "@tsparticles/engine"

// Opciones de partículas definidas fuera del componente para evitar recreación
const particleOptions: ISourceOptions = {
  fullScreen: {
    enable: true,
    zIndex: 5,
  },
  fpsLimit: 60,
  particles: {
    number: {
      value: 200,
      density: {
        enable: true,
        width: 1920,
        height: 1080,
      },
    },
    color: {
      value: "#ffffff",
    },
    shape: {
      type: "circle",
    },
    opacity: {
      value: { min: 0.4, max: 0.9 },
    },
    size: {
      value: { min: 1, max: 5 },
    },
    move: {
      enable: true,
      speed: { min: 0.5, max: 2 },
      direction: "bottom",
      straight: false,
      outModes: {
        default: "out",
      },
      random: true,
    },
    wobble: {
      enable: true,
      distance: 10,
      speed: 5,
    },
  },
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "repulse",
      },
    },
    modes: {
      repulse: {
        distance: 80,
        duration: 0.4,
      },
    },
  },
  detectRetina: true,
}

function SnowParticlesComponent() {
  const [init, setInit] = useState(false)

  useEffect(() => {
    let mounted = true
    
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      if (mounted) {
        setInit(true)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  // useCallback para evitar recrear la función en cada render
  const particlesLoaded = useCallback(async (container?: Container): Promise<void> => {
    // Partículas cargadas correctamente
  }, [])

  if (!init) {
    return null
  }

  return (
    <Particles
      id="snow-particles"
      particlesLoaded={particlesLoaded}
      options={particleOptions}
      style={{ pointerEvents: "none" }}
    />
  )
}

// Memo para evitar re-renders innecesarios del componente
export default memo(SnowParticlesComponent)
