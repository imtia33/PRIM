import React from "react"
import { Button } from "./Button"
import { useRouter } from "expo-router"

export function Header() {
  const router = useRouter()
  const navItems = [
    { name: "Features", href: "#features-section" },
    { name: "Pricing", href: "#pricing-section" },
  ]

  const handleScroll = (e, href) => {
    e.preventDefault()
    const targetId = href.substring(1)
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header className="w-full py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-foreground text-xl font-semibold">PRIM</span>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  const targetId = item.href.substring(1)
                  const targetElement = document.getElementById(targetId)
                  if (targetElement) {
                    targetElement.scrollIntoView({ behavior: "smooth" })
                  }
                }}
                className="text-[#888888] hover:text-foreground px-4 py-2 rounded-full font-medium transition-colors"
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/login')} className="hidden md:block">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 rounded-full font-medium shadow-sm">
              Try for Free
            </Button>
          </button>
          {/* Mobile navigation removed as per user request */}
        </div>
      </div>
    </header>
  )
}