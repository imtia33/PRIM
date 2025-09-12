import React from "react"
import { Check } from "lucide-react-native"
import { Button } from "./Button"

export function PricingSection() {
  const pricingPlan = {
    name: "Free",
    price: "$0",
    description: "Perfect for developers learning GitHub workflows.",
    features: [
      "AI-powered PR reviews",
      "Automated documentation generation",
      "Learn GitHub workflows interactively",
      "BYOAK (Bring Your Own API Key)",
    ],
    buttonText: "Get Started",
    buttonClass: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg",
  }

  return (
    <section className="w-full px-5 overflow-hidden flex flex-col justify-start items-center my-0 py-8 md:py-14">
      <div className="self-stretch relative flex flex-col justify-center items-center gap-2 py-0">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="text-center text-foreground text-4xl md:text-5xl font-semibold leading-tight md:leading-[40px]">
            Simple, transparent pricing
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-tight">
            Start learning GitHub workflows with LLM-powered PR reviews and documentation - completely free(Upto 1.5
            Years).
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center mt-6 max-w-[400px] mx-auto">
        <div className="flex-1 p-6 overflow-hidden rounded-xl flex flex-col justify-start items-start gap-6 bg-primary shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.10)]">
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <div className="self-stretch flex flex-col justify-start items-start gap-8">
              <div className="w-full h-5 text-sm font-medium leading-tight text-primary-foreground">
                {pricingPlan.name}
                <div className="ml-2 px-2 overflow-hidden rounded-full justify-center items-center gap-2.5 inline-flex mt-0 py-0.5 bg-gradient-to-b from-primary-light/50 to-primary-light bg-white">
                  <div className="text-center text-primary-foreground text-xs font-normal leading-tight break-words">
                    {"Upto 1.5 Years"}
                  </div>
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="flex justify-start items-center gap-1.5">
                  <div className="relative h-10 flex items-center text-3xl font-medium leading-10 text-primary-foreground">
                    {pricingPlan.price}
                  </div>
                  <div className="text-center text-sm font-medium leading-tight text-primary-foreground/70">/month</div>
                </div>
                <div className="self-stretch text-sm font-medium leading-tight text-primary-foreground/70">
                  {pricingPlan.description}
                </div>
              </div>
            </div>
            <Button
              className={`self-stretch px-5 py-2 rounded-[40px] flex justify-center items-center ${pricingPlan.buttonClass}`}
            >
              <div className="px-1.5 flex justify-center items-center gap-2">
                <span className="text-center text-sm font-medium leading-tight">{pricingPlan.buttonText}</span>
              </div>
            </Button>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-4">
            <div className="self-stretch text-sm font-medium leading-tight text-primary-foreground/70">
              What's included:
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              {pricingPlan.features.map((feature) => (
                <div key={feature} className="self-stretch flex justify-start items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <Check className="w-full h-full text-primary-foreground" strokeWidth={2} />
                  </div>
                  <div className="leading-tight font-normal text-sm text-left text-primary-foreground">{feature}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}