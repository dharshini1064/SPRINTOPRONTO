import OpenAI from "openai"

const apiKey = process.env.GROQ_API_KEY || ""

export const groq = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: false, // Node/API route context only
})

export function isGroqConfigured(): boolean {
  return (
    typeof process !== "undefined" &&
    !!process.env.GROQ_API_KEY &&
    process.env.GROQ_API_KEY !== "your_key_here" &&
    process.env.GROQ_API_KEY.trim() !== ""
  )
}
