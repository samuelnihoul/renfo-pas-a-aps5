"use client"

import { useState, useRef, useEffect, ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CarouselProps {
  children: ReactNode[]
  className?: string
  itemClassName?: string
}

export function Carousel({ children, className = "", itemClassName = "" }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showArrows, setShowArrows] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement>(null)

  const items = Array.isArray(children) ? children : [children]
  const canScrollLeft = currentIndex > 0
  const canScrollRight = currentIndex < items.length - 1

  const scrollToIndex = (index: number) => {
    if (!itemsRef.current || !containerRef.current) return
    
    const container = containerRef.current
    const item = itemsRef.current.children[index] as HTMLElement
    if (!item) return
    
    const containerWidth = container.offsetWidth
    const itemLeft = item.offsetLeft
    const itemWidth = item.offsetWidth
    
    // Centrer l'élément dans le conteneur
    const scrollTo = itemLeft - (containerWidth - itemWidth) / 2
    
    container.scrollTo({
      left: scrollTo,
      behavior: 'smooth'
    })
    
    setCurrentIndex(index)
  }

  const scrollToPrev = () => {
    if (canScrollLeft) {
      scrollToIndex(currentIndex - 1)
    }
  }

  const scrollToNext = () => {
    if (canScrollRight) {
      scrollToIndex(currentIndex + 1)
    }
  }

  // Gestion du défilement tactile
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    let startX: number
    let scrollLeft: number
    let isDown = false
    
    const handleMouseDown = (e: MouseEvent) => {
      isDown = true
      startX = e.pageX - container.offsetLeft
      scrollLeft = container.scrollLeft
      container.style.cursor = 'grabbing'
      container.style.scrollBehavior = 'auto'
    }
    
    const handleMouseLeave = () => {
      isDown = false
      container.style.cursor = 'grab'
      container.style.scrollBehavior = 'smooth'
    }
    
    const handleMouseUp = () => {
      isDown = false
      container.style.cursor = 'grab'
      container.style.scrollBehavior = 'smooth'
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - container.offsetLeft
      const walk = (x - startX) * 2
      container.scrollLeft = scrollLeft - walk
    }
    
    // Gestion du touch
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      startX = touch.pageX - container.offsetLeft
      scrollLeft = container.scrollLeft
      container.style.scrollBehavior = 'auto'
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return
      e.preventDefault()
      const touch = e.touches[0]
      const x = touch.pageX - container.offsetLeft
      const walk = (x - startX) * 2
      container.scrollLeft = scrollLeft - walk
    }
    
    const handleTouchEnd = () => {
      container.style.scrollBehavior = 'smooth'
    }
    
    // Événements souris
    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mouseleave', handleMouseLeave)
    container.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mousemove', handleMouseMove)
    
    // Événements tactiles
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
    
    // Vérifier si les flèches doivent être affichées
    const checkArrows = () => {
      if (container.scrollWidth > container.clientWidth) {
        setShowArrows(true)
      } else {
        setShowArrows(false)
      }
    }
    
    checkArrows()
    window.addEventListener('resize', checkArrows)
    
    return () => {
      // Nettoyage des écouteurs d'événements
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mouseleave', handleMouseLeave)
      container.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('touchstart', handleTouchStart as EventListener)
      container.removeEventListener('touchmove', handleTouchMove as EventListener)
      container.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('resize', checkArrows)
    }
  }, [])

  return (
    <div className={`relative group ${className}`}>
      {showArrows && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full w-8 h-8 p-0 shadow-md hover:bg-white transition-all ${
              !canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            onClick={scrollToPrev}
            disabled={!canScrollLeft}
            aria-label="Précédent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full w-8 h-8 p-0 shadow-md hover:bg-white transition-all ${
              !canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            onClick={scrollToNext}
            disabled={!canScrollRight}
            aria-label="Suivant"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
      
      <div 
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1 -mx-1 snap-x snap-mandatory"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        <div 
          ref={itemsRef}
          className="flex gap-4"
        >
          {items.map((child, index) => (
            <div 
              key={index} 
              className={`flex-shrink-0 w-[280px] snap-start ${itemClassName}`}
              onClick={() => scrollToIndex(index)}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
