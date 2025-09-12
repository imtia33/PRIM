import React from "react"

export const BentoCard = ({ title, description, Component }) => (
  <div className="overflow-hidden rounded-2xl border border-white/20 flex flex-col justify-start items-start relative">
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background: "rgba(231, 236, 235, 0.08)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />

    <div className="self-stretch p-4 md:p-6 flex flex-col justify-start items-start gap-2 relative z-10">
      <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
        <p className="self-stretch text-foreground text-lg font-normal leading-7">
          {title} <br />
          <span className="text-muted-foreground">{description}</span>
        </p>
      </div>
    </div>
    <div className="self-stretch h-72 relative -mt-0.5 z-10">
      <Component />
    </div>
  </div>
)