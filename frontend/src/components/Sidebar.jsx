import { useState, useRef } from "react"

export default function Sidebar({ pdfLoaded, filename, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const uploadFile = async (file) => {
    if (!file || !file.name.endsWith(".pdf")) {
      setError("Only PDF files are supported.")
      return
    }

    setError(null)
    setUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.detail || "Upload failed")

      onUploadSuccess(data.filename)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e) => uploadFile(e.target.files[0])
  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    uploadFile(e.dataTransfer.files[0])
  }

  return (
    <div className="w-72 h-screen flex flex-col shrink-0"
      style={{ background: "#13131a", borderRight: "0.5px solid #2a2a3a" }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "0.5px solid #2a2a3a" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "#534AB7" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
            <path d="M12 8v4l3 3" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">DocChat</div>
          <div className="text-xs" style={{ color: "#6b6b8a" }}>AI Support Assistant</div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 py-5 flex-1">

        {/* Upload zone */}
        <div
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className="rounded-xl flex flex-col items-center justify-center gap-2 py-7 px-4 cursor-pointer transition-all"
          style={{
            border: `1.5px dashed ${dragOver ? "#534AB7" : "#2a2a3a"}`,
            background: dragOver ? "#1a1a2e" : "transparent",
          }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-1"
            style={{ background: "#1e1b3a" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          {uploading ? (
            <div className="text-xs font-medium" style={{ color: "#534AB7" }}>
              Processing PDF...
            </div>
          ) : (
            <>
              <div className="text-xs font-medium text-white">Upload your PDF</div>
              <div className="text-xs text-center" style={{ color: "#6b6b8a" }}>
                Drag & drop or click to browse
              </div>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-xs px-3 py-2 rounded-lg"
            style={{ background: "#2a1a1a", color: "#f09595" }}>
            {error}
          </div>
        )}

        {/* Loaded doc */}
        {pdfLoaded && filename && (
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl"
            style={{ background: "#1e1b3a", border: "0.5px solid #534AB7" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "#534AB7" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-medium text-white truncate">{filename}</div>
              <div className="text-xs mt-0.5" style={{ color: "#7F77DD" }}>Ready to answer</div>
            </div>
          </div>
        )}

        {/* Info text */}
        <div className="text-xs leading-relaxed px-1" style={{ color: "#6b6b8a" }}>
          Upload any PDF — product manuals, support docs, policies. The AI answers only from the document content.
        </div>

        {/* Status */}
        <div className="mt-auto flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: "#0f1f0f", border: "0.5px solid #27500A" }}>
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#639922" }} />
          <div className="text-xs font-medium" style={{ color: "#639922" }}>
            Llama 3 · Groq · Connected
          </div>
        </div>

      </div>
    </div>
  )
}