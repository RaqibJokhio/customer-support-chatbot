import { useState, useRef, useEffect } from "react"
import MessageBubble from "./MessageBubble"

export default function ChatWindow({ messages, loading, pdfLoaded, onAsk }) {
  const [input, setInput] = useState("")
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleSubmit = () => {
    if (!input.trim() || loading || !pdfLoaded) return
    onAsk(input.trim())
    setInput("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden"
      style={{ background: "#0f0f13" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ borderBottom: "0.5px solid #2a2a3a" }}>
        <div>
          <div className="text-sm font-semibold text-white">Chat with your document</div>
          <div className="text-xs mt-0.5" style={{ color: "#6b6b8a" }}>
            {pdfLoaded ? "Document loaded — ask anything" : "Upload a PDF to get started"}
          </div>
        </div>
        <div className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ background: "#1e1b3a", color: "#7F77DD" }}>
          Llama 3 · 8B
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#1e1b3a" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#7F77DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5"
              style={{ background: "#1a1a24" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "#534AB7",
                    animation: "bounce 1s infinite",
                    animationDelay: `${i * 0.15}s`
                  }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 shrink-0" style={{ borderTop: "0.5px solid #2a2a3a" }}>
        <div className="flex items-end gap-3">
          <div className="flex-1 rounded-2xl px-4 py-3 flex items-end gap-3"
            style={{ background: "#1a1a24", border: "0.5px solid #2a2a3a" }}>
            <textarea
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = "auto"
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
              }}
              onKeyDown={handleKeyDown}
              placeholder={pdfLoaded ? "Ask a question about your document..." : "Upload a PDF first..."}
              disabled={!pdfLoaded || loading}
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none resize-none leading-relaxed"
              style={{ maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!pdfLoaded || loading || !input.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all"
            style={{
              background: pdfLoaded && input.trim() ? "#534AB7" : "#1e1b3a",
              cursor: pdfLoaded && input.trim() ? "pointer" : "not-allowed",
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="text-xs mt-2 text-center" style={{ color: "#3a3a4a" }}>
          Enter to send · Shift+Enter for new line
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}