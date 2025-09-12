import React from "react"
import { Twitter, Github, Linkedin } from "lucide-react-native"

export function FooterSection() {
  return (
    <footer className="w-full max-w-[1320px] mx-auto px-5 flex flex-col md:flex-row justify-between items-start gap-8 md:gap-0 py-10 md:py-[70px]">
      <div className="flex flex-col justify-start items-start gap-8 p-4 md:p-8">
        <div className="flex gap-3 items-stretch justify-center">
          <div className="text-center text-foreground text-xl font-semibold leading-4">PRIM</div>
        </div>
        <p className="text-foreground/90 text-sm font-medium leading-[18px] text-left">Contribution made effortless</p>
        <div className="flex justify-start items-start gap-3">
          <a
            href="https://twitter.com/primlabs"
            aria-label="Twitter"
            className="w-4 h-4 flex items-center justify-center"
          >
            <Twitter className="w-full h-full text-muted-foreground" />
          </a>
          <a
            href="https://github.com/primlabs"
            aria-label="GitHub"
            className="w-4 h-4 flex items-center justify-center"
          >
            <Github className="w-full h-full text-muted-foreground" />
          </a>
          <a
            href="https://linkedin.com/company/primlabs"
            aria-label="LinkedIn"
            className="w-4 h-4 flex items-center justify-center"
          >
            <Linkedin className="w-full h-full text-muted-foreground" />
          </a>
        </div>
      </div>
    </footer>
  )
}