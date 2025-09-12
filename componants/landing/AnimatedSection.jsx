import React, { useState, useRef, useEffect } from "react"

export function AnimatedSection({ children, className, delay = 0, ...props }) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [isVisible])

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-800 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-5 scale-95'
      } ${className || ''}`}
      style={{
        transitionDelay: `${delay * 1000}ms`,
        ...props.style
      }}
      {...props}
    >
      {children}
    </div>
  )
}