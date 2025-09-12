import React from "react"
import { GitMerge, Github, GitPullRequestArrowIcon } from "lucide-react-native"

export function OneClickIntegrationsIllustration() {
  const themeVars = {
    "--oci-primary-color": "hsl(var(--primary))",
    "--oci-background-color": "hsl(var(--background))",
    "--oci-foreground-color": "hsl(var(--foreground))",
    "--oci-muted-foreground-color": "hsl(var(--muted-foreground))",
    "--oci-border-color": "hsl(var(--border))",
    "--oci-shadow-color": "rgba(0, 0, 0, 0.12)",
    "--oci-gradient-light-gray-start": "hsl(var(--foreground) / 0.2)",
    "--oci-gradient-light-gray-end": "transparent",
  } 

  const LogoBox = ({ logoSvg, isGradientBg }) => {
    const boxStyle = {
      width: "60px",
      height: "60px",
      position: "relative",
      borderRadius: "9px",
      border: `1px ${themeVars["--oci-border-color"]} solid`,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      flexShrink: 0,
    }

    const innerContentStyle = {
      width: "36px",
      height: "36px",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }

    if (isGradientBg) {
      boxStyle.background = `linear-gradient(180deg, ${themeVars["--oci-gradient-light-gray-start"]} 0%, ${themeVars["--oci-gradient-light-gray-end"]} 100%)`
      boxStyle.boxShadow = `0px 1px 2px ${themeVars["--oci-shadow-color"]}`
      boxStyle.backdropFilter = "blur(18px)"
      boxStyle.padding = "6px 8px"
    }

    return <div style={boxStyle}>{logoSvg && <div style={innerContentStyle}>{logoSvg}</div>}</div>
  }

  const GitMergeLogo = <GitMerge size={24} color="var(--oci-primary-color)" />

  const AppwriteLogo = (
    <svg width="24" height="21" viewBox="0 0 445 392" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="m184.434-.238 2.384-.03C244.423-.837 294.439 17.553 336 58c21.889 21.58 40.253 51.063 48 81v4c-13.76.325-27.52.573-41.283.725-6.392.073-12.781.172-19.172.331-6.173.153-12.343.236-18.518.272q-3.526.038-7.048.152c-17.94.556-17.94.556-22.999-2.833-3.37-3.216-5.662-6.865-7.9-10.917-5.144-8.24-14.824-14.048-23.08-18.73l-2.797-1.586c-23.77-12.656-50.276-14.305-75.922-6.577-24.586 7.896-44.596 25.406-56.354 48.263-11.622 23.819-13.549 50.864-4.978 75.993 9.173 25.244 26.633 44.107 50.653 55.962 12.17 5.629 24.762 8.09 38.104 8.103l3.27.015c3.616.016 7.232.024 10.848.032l7.776.03q8.37.032 16.74.056 12.105.035 24.206.08 19.635.071 39.272.132 19.073.059 38.146.125l2.376.008 11.8.041q48.93.17 97.86.323v99a97952 97952 0 0 1-112.921.165l-2.403.002q-19.2.021-38.398.064-19.735.043-39.47.051-12.155.005-24.308.042-8.363.023-16.724.017-4.807-.004-9.613.017c-35.308.153-67.929-6.562-99.163-23.358l-1.79-.94C77.457 356.073 56.767 338.226 41 318l-1.326-1.7A190 190 0 0 1 21 287l-1.148-2.202C10.454 266.562 4.412 247.218 1 227l-.53-3.104c-.577-4.784-.67-9.491-.708-14.306l-.025-3.04q-.02-3.19-.032-6.377-.018-3.195-.062-6.39C-1.06 143.44 19.053 96.785 53 60l1.417-1.538C61.605 50.756 69.553 44.25 78 38l1.633-1.21C109.476 14.884 147.157.146 184.433-.239"
        fill="#FD366E"
      />
      <path
        d="M289 169h156v99H263c1.9-3.799 3.762-6.112 6.563-9.25 15.002-17.569 22.404-39.496 22.75-62.437l.054-2.318c-.013-8.729-1.787-16.042-3.367-24.995"
        fill="#FD366E"
      />
    </svg>
  )

  const GitHubLogo = <Github size={24} color="var(--oci-primary-color)" />

  const GitMergeSecondLogo = <GitPullRequestArrowIcon size={24} color="var(--oci-primary-color)" />

  const VSCodeLogo = (
    <svg width="36" height="38" viewBox="0 0 36 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_254_68700)">
        <path
          d="M21.043 36.4463C20.0985 37.6356 18.1836 36.984 18.1609 35.4653L17.8281 13.2539H32.7631C35.4682 13.2539 36.9769 16.3783 35.2948 18.4969L21.043 36.4463Z"
          fill="url(#paint0_linear_254_68700)"
        />
        <path
          d="M21.043 36.4463C20.0985 37.6356 18.1836 36.984 18.1609 35.4653L17.8281 13.2539H32.7631C35.4682 13.2539 36.9769 16.3783 35.2948 18.4969L21.043 36.4463Z"
          fill="url(#paint1_linear_254_68700)"
          fillOpacity="0.2"
        />
        <path
          d="M14.9668 0.706059C15.9112 -0.483394 17.8261 0.16834 17.8489 1.68697L17.9947 23.8984H3.24665C0.541445 23.8984 -0.967295 20.7739 0.714879 18.6554L14.9668 0.706059Z"
          fill="var(--oci-primary-color)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_254_68700"
          x1="17.8281"
          y1="18.1787"
          x2="31.1018"
          y2="23.7457"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--oci-primary-color)" />
          <stop offset="1" stopColor="var(--oci-primary-color)" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_254_68700"
          x1="11.9433"
          y1="10.1213"
          x2="17.9968"
          y2="21.5167"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
        <clipPath id="clip0_254_68700">
          <rect width="36" height="37.3211" fill="white" transform="translate(0 0.0224609)" />
        </clipPath>
      </defs>
    </svg>
  )

  const gridItems = Array(40)
    .fill(null)
    .map((_, i) => {
      const item = {}
      const row = Math.floor(i / 10)
      const col = i % 10

      if (row === 0 && col === 3) {
        item.logoSvg = GitMergeLogo
        item.isGradientBg = true
      } else if (row === 1 && col === 5) {
        item.logoSvg = AppwriteLogo
        item.isGradientBg = true
      } else if (row === 2 && col === 3) {
        item.logoSvg = GitHubLogo
        item.isGradientBg = true
      } else if (row === 2 && col === 7) {
        item.logoSvg = GitMergeSecondLogo
        item.isGradientBg = true
      } else if (row === 3 && col === 5) {
        item.logoSvg = VSCodeLogo
        item.isGradientBg = true
      }
      return item
    })

  return (
    <div
      className="w-full h-full relative"
      style={{
        ...themeVars,
      }}
      role="img"
      aria-label="One-click integrations illustration showing a grid of connected squares"
    >
      <div
        style={{
          width: "377.33px",
          height: "278.08px",
          left: "0px",
          top: "24px",
          position: "absolute",
          background: `radial-gradient(ellipse 103.87% 77.04% at 52.56% -1.80%, 
            ${themeVars["--oci-foreground-color"]}00 0%, 
            ${themeVars["--oci-foreground-color"]}F5 15%, 
            ${themeVars["--oci-foreground-color"]}66 49%, 
            ${themeVars["--oci-foreground-color"]}F5 87%, 
            ${themeVars["--oci-foreground-color"]}00 100%)`,
        }}
      />

      <div
        style={{
          width: "377px",
          height: "265px",
          left: "0.34px",
          top: "43.42px",
          position: "absolute",
          backdropFilter: "blur(7.91px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {Array.from({ length: 4 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "16px" }}
          >
            {gridItems.slice(rowIndex * 10, (rowIndex + 1) * 10).map((item, colIndex) => (
              <LogoBox key={colIndex} {...item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}