import React, { useState } from "react"
import { ChevronDown } from "lucide-react-native"

const faqData = [
  {
    question: "What is PRIM and who is it for?",
    answer:
      "PRIM (Pull, Refactor, Inspect, Merge) is an AI-powered tool designed for developers who want to improve their code quality and learn GitHub workflows. It's perfect for both beginners learning version control and experienced developers seeking automated PR reviews and documentation.",
  },
  {
    question: "How does PRIM's AI PR review work?",
    answer:
      "Our AI analyzes your pull requests in real-time, providing intelligent feedback on code quality, potential bugs, and best practices. It generates comprehensive documentation and helps you understand GitHub workflows through interactive learning experiences.",
  },
  {
    question: "What does BYOAK (Bring Your Own API Key) mean?",
    answer:
      "BYOAK means you use your own API keys for AI services, giving you full control over costs and usage. This keeps PRIM free while allowing you to leverage powerful AI models for code analysis and documentation generation.",
  },
  {
    question: "How many PR reviews do I get per month?",
    answer:
      "The free plan includes as many reviews you can by your api key.",
  },
  {
    question: "How does PRIM help me learn GitHub workflows?",
    answer:
      "PRIM provides interactive guidance throughout the pull request process, explaining best practices, suggesting improvements, and helping you understand version control concepts. It's like having a mentor review your code and teach you GitHub workflows simultaneously.",
  },
  {
    question: "Is my code secure with PRIM?",
    answer:
      "Absolutely. Since you bring your own API keys, your code is processed through your chosen AI service with your security settings. PRIM doesn't store your code permanently and follows best practices for secure code analysis and documentation generation.",
  },
]

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  const handleClick = (e) => {
    e.preventDefault()
    onToggle()
  }
  return (
    <div
      className={`w-full bg-[rgba(231,236,235,0.08)] shadow-[0px_2px_4px_rgba(0,0,0,0.16)] overflow-hidden rounded-[10px] outline outline-1 outline-border outline-offset-[-1px] transition-all duration-300 ease-out cursor-pointer`}
      onClick={handleClick}
    >
      <div className="w-full px-5 py-[18px] pr-4 flex justify-between items-center gap-5 text-left transition-all duration-200 ease-out">
        <div className="flex-1 text-foreground text-base font-medium leading-6 break-words">{question}</div>
        <div className="flex justify-center items-center">
          <ChevronDown
            className={`w-6 h-6 text-muted-foreground-dark transition-all duration-300 ease-out ${isOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"}`}
          />
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
        style={{
          transitionProperty: "max-height, opacity, padding",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className={`px-5 transition-all duration-300 ease-out ${isOpen ? "pb-[18px] pt-2 translate-y-0" : "pb-0 pt-0 -translate-y-2"}`}
        >
          <div className="text-foreground/80 text-sm font-normal leading-6 break-words">{answer}</div>
        </div>
      </div>
    </div>
  )
}

export function FAQSection() {
  const [openItems, setOpenItems] = useState(new Set())
  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }
  return (
    <section className="w-full pt-[66px] pb-20 md:pb-40 px-5 relative flex flex-col justify-center items-center">
      <div className="w-[300px] h-[500px] absolute top-[150px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[100px] z-0" />
      <div className="self-stretch pt-8 pb-8 md:pt-14 md:pb-14 flex flex-col justify-center items-center gap-2 relative z-10">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="w-full max-w-[435px] text-center text-foreground text-4xl font-semibold leading-10 break-words">
            Frequently Asked Questions
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-[18.20px] break-words">
            Everything you need to know about PRIM and how it can improve your GitHub workflow
          </p>
        </div>
      </div>
      <div className="w-full max-w-[600px] pt-0.5 pb-10 flex flex-col justify-start items-start gap-4 relative z-10">
        {faqData.map((faq, index) => (
          <FAQItem key={index} {...faq} isOpen={openItems.has(index)} onToggle={() => toggleItem(index)} />
        ))}
      </div>
    </section>
  )
}