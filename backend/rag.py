import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

load_dotenv()


def load_pdf(pdf_path: str):
    loader = PyMuPDFLoader(pdf_path)
    documents = loader.load()
    return documents


def split_documents(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_documents(documents)
    return chunks


def build_vector_store(chunks):
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vector_store = FAISS.from_documents(chunks, embeddings)
    return vector_store


def build_qa_chain(vector_store):
    llm = ChatGroq(
        model="llama3-8b-8192",
        api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.2
    )

    prompt = PromptTemplate.from_template("""
You are a helpful customer support assistant.
Use ONLY the context below to answer the question.
If the answer is not in the context, say "I don't have information about that in the uploaded document."

Context:
{context}

Question:
{question}

Answer:
""")

    retriever = vector_store.as_retriever(search_kwargs={"k": 4})

    # LCEL chain — modern LangChain way of chaining steps
    # retriever → prompt → llm → parse output as string
    chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return {"chain": chain, "retriever": retriever}


def process_pdf_and_build_chain(pdf_path: str):
    documents = load_pdf(pdf_path)
    chunks = split_documents(documents)
    vector_store = build_vector_store(chunks)
    result = build_qa_chain(vector_store)
    return result