import React from "react"
import { BentoCard } from "./BentoCard"
import { AiCodeReviews } from "./AiCodeReviews"
import { RealtimeCodingPreviews } from "./RealtimeCodingPreviews"
import { OneClickIntegrationsIllustration } from "./OneClickIntegrationsIllustration"
import { MCPConnectivityIllustration } from "./MCPConnectivityIllustration"
import { EasyDeployment } from "./EasyDeployment"
import { ParallelCodingAgents } from "./ParallelCodingAgents"
import { useEffect } from "react"

export function BentoSection() {
  const cards = [
    {
      title: "Faster code reviews.",
      description: "Get fast, smart suggestions for cleaner code.",
      Component: AiCodeReviews,
    },
    {
      title: "Better PR Documentation",
      description: "Create better documentation of your contribution.",
      Component: RealtimeCodingPreviews,
    },
    {
      title: "Secure Colaboration",
      description: "Better auth integration with appwrite, and your key is safe from abuse.",
      Component: OneClickIntegrationsIllustration,
    },
    {
      title: "PR Analytics & Insights",
      description: "Track review metrics, identify bottlenecks, and optimize your team's workflow.",
      Component: MCPConnectivityIllustration,
    },
    {
      title: "Automated PR Workflows",
      description: "Streamline your pull request process with intelligent automation and smart routing.",
      Component: EasyDeployment,
    },
    {
      title: "BYOAK Freedom",
      description: "Use your preferred LLM (OpenAI, Claude, Gemini) with full control.",
      Component: ParallelCodingAgents,
    },
  ]

  return (
    <section className="w-full flex flex-col justify-center items-center overflow-hidden bg-transparent px-3 md:px-6">
      <div className="w-full max-w-[1320px] py-12 md:py-20 relative flex flex-col justify-start items-start gap-8 mx-auto">
        <div className="w-[350px] h-[500px] absolute top-[300px] left-[30px] origin-top-left rotate-[-33.39deg] bg-primary/8 blur-[80px] z-0 pointer-events-none" />
        <div className="self-stretch py-8 md:py-14 flex flex-col justify-center items-center gap-2 z-10">
          <div className="flex flex-col justify-start items-center gap-4">
            <h2 className="w-full max-w-[655px] text-center text-foreground text-4xl md:text-6xl font-semibold leading-tight md:leading-[66px]">
              Empower Your Workflow with LLM's
            </h2>
          </div>
        </div>
        <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 z-10">
          {cards.map((card) => (
            <BentoCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}