export default function MessageBubble({ message }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: isUser ? "#534AB7" : "#1e1b3a" }}>
        {isUser ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#7F77DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
            <path d="M12 8v4l3 3" />
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-2 max-w-[75%]`}>
        <div
          className="text-sm leading-relaxed px-4 py-3 rounded-2xl"
          style={{
            background: isUser ? "#534AB7" : "#1a1a24",
            color: message.error ? "#f09595" : "white",
            borderRadius: isUser
              ? "18px 18px 4px 18px"
              : "18px 18px 18px 4px",
          }}>
          {message.text}
        </div>

        {/* Source tags */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap px-1">
            <span className="text-xs" style={{ color: "#6b6b8a" }}>Sources:</span>
            {message.sources.map((page, i) => (
              <span key={i}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "#1e1b3a", color: "#7F77DD", border: "0.5px solid #534AB7" }}>
                Page {page + 1}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}