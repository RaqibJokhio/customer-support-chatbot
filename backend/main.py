import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import process_pdf_and_build_chain

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

qa_chain_store = {"chain": None, "retriever": None, "filename": None}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = process_pdf_and_build_chain(file_path)
        qa_chain_store["chain"] = result["chain"]
        qa_chain_store["retriever"] = result["retriever"]
        qa_chain_store["filename"] = file.filename
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

    return {
        "message": f"'{file.filename}' uploaded and processed successfully.",
        "filename": file.filename
    }


class QuestionRequest(BaseModel):
    question: str


@app.post("/ask")
async def ask_question(body: QuestionRequest):
    if qa_chain_store["chain"] is None:
        raise HTTPException(status_code=400, detail="No PDF uploaded yet. Please upload a document first.")

    if not body.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        answer = qa_chain_store["chain"].invoke(body.question)
        source_docs = qa_chain_store["retriever"].invoke(body.question)
        sources = list(set([
            doc.metadata.get("page", "unknown")
            for doc in source_docs
        ]))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating answer: {str(e)}")

    return {
        "answer": answer,
        "sources": sources,
        "document": qa_chain_store["filename"]
    }


@app.get("/status")
def get_status():
    return {
        "pdf_loaded": qa_chain_store["chain"] is not None,
        "filename": qa_chain_store["filename"]
    }