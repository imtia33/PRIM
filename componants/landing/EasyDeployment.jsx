import React from "react"

export function EasyDeployment() {
  const themeVars = {
    "--deploy-primary-color": "hsl(var(--primary))",
    "--deploy-background-color": "hsl(var(--background))",
    "--deploy-text-color": "hsl(var(--foreground))",
    "--deploy-text-secondary": "hsl(var(--muted-foreground))",
    "--deploy-border-color": "hsl(var(--border))",
  } 

  const logLines = [
    "[16:37:25.637] Pull Request #42 received – Branch: feature/improve-auth",
    "[16:37:25.638] Checking repository configuration: 2 reviewers, 3 checks",
    "[16:37:25.653] Retrieving changed files...",
    "[16:37:25.741] Previous review context not available",
    "[16:37:25.979] Analyzing 84 modified files...",
    '[16:37:29.945] Running "PR Analysis Pipeline"',
    "[16:37:30.561] Workflow Engine v2.3.1",
    '[16:37:30.880] Running "install checks" step: `lint + tests`...',
    "[16:37:30.914] Linting started...",
    "[16:37:30.940] Resolving dependencies in changes",
    "[16:37:34.436] Resolved 1116 issues & warnings scanned",
    '[16:37:34.436] ⚠️  1 peer dependency mismatch detected: "react@19.1.0"',
    "[16:37:37.265] Saved PR review summary",
    "[16:37:39.076] Security & compliance checks initiated",
    "[16:37:39.137] ✓ Code style & formatting passed",
    "[16:37:41.439] ✓ Tests compiled & passed successfully",
    "[16:37:53.979] ✓ Generated PR documentation & changelog",
    "[16:38:00.585] ○ (Automated) Review suggestions added as comments",
    "[16:38:01.099] ✅ PR Workflow Completed in [30s]",
    "🚀 Pull Request ready for review – Smooth & Automated!",
  ]

  return (
    <div
      className="w-full h-full flex items-center justify-center p-4 relative"
      style={{
        position: "relative",
        background: "transparent",
        ...themeVars,
      }}
      role="img"
      aria-label="Deployment console output with Deploy on Vercel button"
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "340px",
          height: "239px",
          background: "linear-gradient(180deg, var(--deploy-background-color) 0%, transparent 100%)",
          backdropFilter: "blur(7.907px)",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "2px",
            borderRadius: "8px",
            background: "hsl(var(--foreground) / 0.08)",
          }}
        />

        <div
          style={{
            position: "relative",
            padding: "8px",
            height: "100%",
            overflow: "hidden",
            fontFamily: "'Geist Mono', 'SF Mono', Monaco, Consolas, 'Liberation Mono', monospace",
            fontSize: "10px",
            lineHeight: "16px",
            color: "var(--deploy-text-color)",
            whiteSpace: "pre",
          }}
        >
          {logLines.map((line, index) => (
            <p key={index} style={{ margin: 0 }}>
              {line}
            </p>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "0.791px solid var(--deploy-border-color)",
            borderRadius: "10px",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  )
}