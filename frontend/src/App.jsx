import { useState, useEffect } from "react"
import Sidebar from "./components/Sidebar"
import ChatWindow from "./components/ChatWindow"

export default function App() {
  const [pdfLoaded, setPdfLoaded] = useState(false)
  const [filename, setFilename] = useState(null)
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! Upload a PDF and I'll answer any questions about it.",
    },
  ])
  const [loading, setLoading] = useState(false)

  const handleUploadSuccess = (name) => {
    setFilename(name)
    setPdfLoaded(true)
    setMessages([
      {
        role: "bot",
        text: `I've read "${name}". Ask me anything about it!`,
      },
    ])
  }

  const handleAsk = async (question) => {
    if (!question.trim() || loading) return

    const userMessage = { role: "user", text: question }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Something went wrong")
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.answer,
          sources: data.sources,
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `Error: ${err.message}`,
          error: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        pdfLoaded={pdfLoaded}
        filename={filename}
        onUploadSuccess={handleUploadSuccess}
      />
      <ChatWindow
        messages={messages}
        loading={loading}
        pdfLoaded={pdfLoaded}
        onAsk={handleAsk}
      />
    </div>
  )
}