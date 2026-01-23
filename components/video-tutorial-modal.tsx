"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Play, X, Maximize2, Minimize2 } from "lucide-react"

interface VideoTutorialModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function VideoTutorialModal({ open, onOpenChange }: VideoTutorialModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isFullscreen ? 'max-w-[95vw] w-[95vw] h-[90vh]' : 'max-w-6xl w-full max-h-[85vh]'} bg-white`}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">
            Tutorial del Sistema
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="hover:bg-gray-100"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </DialogHeader>
        
        <div className={`${isFullscreen ? 'h-[75vh]' : 'h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh]'} bg-gray-900 rounded-lg overflow-hidden relative`}>
          <iframe
            src="https://www.youtube.com/embed/uEG8pCvSAI0?rel=0&modestbranding=1&autohide=1&showinfo=0&controls=1"
            width="100%"
            height="100%"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            style={{ border: 0 }}
            className="w-full h-full"
            allowFullScreen
            title="Tutorial del Sistema de Citas"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
