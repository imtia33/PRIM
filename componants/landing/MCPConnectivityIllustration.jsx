import React from "react"
import { 
  GitPullRequest, 
  FileDiff, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Bot 
} from "lucide-react-native"

export function MCPConnectivityIllustration() {
  const workflowSteps = [
    { name: "Pull Request Opened", icon: GitPullRequest, status: "Completed" },
    { name: "Files Changed", icon: FileDiff, status: "Analyzed" },
    { name: "Lint & Tests", icon: CheckCircle2, status: "Passed" },
    { name: "Security Scan", icon: ShieldCheck, status: "Passed" },
    { name: "Docs Generated", icon: FileText, status: "Created" },
    { name: "AI Review Bot", icon: Bot, status: "Active" },
  ]

  return (
    <div
      className="w-full h-full flex items-center justify-center p-4 relative"
      role="img"
      aria-label="Automated PR Workflow component showcasing pipeline steps"
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, calc(-50% + 24px))",
          width: "345px",
          height: "277px",
          background: "linear-gradient(180deg, hsl(var(--background)) 0%, transparent 100%)",
          backdropFilter: "blur(16px)",
          borderRadius: "9.628px",
          border: "0.802px solid hsl(var(--border))",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12.837px",
              padding: "8.826px 12.837px",
              borderBottom: "0.802px solid hsl(var(--border))",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <GitPullRequest className="w-4 h-4 text-muted-foreground" />
            <span
              style={{
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: "12.837px",
                lineHeight: "19.256px",
                color: "hsl(var(--muted-foreground))",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              PR Workflow
            </span>
          </div>

          {workflowSteps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div
                key={step.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8.826px 12.837px",
                  borderBottom: index < workflowSteps.length - 1 ? "0.479px solid hsl(var(--border))" : "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12.837px",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconComponent className="w-full h-full text-muted-foreground opacity-70" />
                  </div>
                  <span
                    style={{
                      fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      fontSize: "12.837px",
                      lineHeight: "19.256px",
                      color: "hsl(var(--muted-foreground))",
                      fontWeight: 400,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.name}
                  </span>
                </div>
                <div
                  style={{
                    background: "hsl(var(--primary) / 0.08)",
                    padding: "1.318px 5.272px",
                    borderRadius: "3.295px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      fontSize: "9.583px",
                      lineHeight: "15.333px",
                      color: "hsl(var(--primary))",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}