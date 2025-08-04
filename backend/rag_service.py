from fastapi import FastAPI, UploadFile, File, Form, Depends
from pydantic import BaseModel
import os, shutil, json
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import TextLoader
from langchain.llms import OpenAI

app = FastAPI()

# User authentication stub (replace with real auth)
def get_user_id():
    return "user123"

# Load and embed documents at startup
loader = TextLoader("docs/tech")
docs = loader.load()
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(docs)
embeddings = OpenAIEmbeddings()
vector_db = FAISS.from_documents(chunks, embeddings)
llm = OpenAI()

@app.post("/rag/upload")
def upload_knowledge(file: UploadFile = File(...), user_id: str = Depends(get_user_id)):
    user_dir = f"knowledge/{user_id}/"
    os.makedirs(user_dir, exist_ok=True)
    with open(os.path.join(user_dir, file.filename), "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"status": "uploaded", "filename": file.filename}

@app.get("/rag/files")
def list_files(user_id: str = Depends(get_user_id)):
    user_dir = f"knowledge/{user_id}/"
    return {"files": os.listdir(user_dir) if os.path.exists(user_dir) else []}

@app.get("/rag/file/{filename}")
def get_file(filename: str, user_id: str = Depends(get_user_id)):
    user_dir = f"knowledge/{user_id}/"
    with open(os.path.join(user_dir, filename), "r") as f:
        return {"content": f.read()}

class Settings(BaseModel):
    conversation_id: str
    knowledge_files: list
    model: str
    api_key: str

@app.post("/rag/settings")
def set_settings(settings: Settings, user_id: str = Depends(get_user_id)):
    conv_dir = f"conversations/{user_id}/"
    os.makedirs(conv_dir, exist_ok=True)
    with open(os.path.join(conv_dir, f"{settings.conversation_id}.json"), "w") as f:
        json.dump(settings.dict(), f)
    return {"status": "settings saved"}

class QueryRequest(BaseModel):
    query: str
    conversation_id: str = None
    settings: dict = None

@app.post("/rag/query")
def rag_query(req: QueryRequest):
    try:
        # Load conversation settings if provided
        user_id = get_user_id()
        if req.conversation_id:
            conv_dir = f"conversations/{user_id}/"
            settings_file = os.path.join(conv_dir, f"{req.conversation_id}.json")
            if os.path.exists(settings_file):
                with open(settings_file, "r") as f:
                    settings = json.load(f)
                    # Use conversation-specific knowledge files
                    if settings.get("knowledge_files"):
                        # Load and embed selected files
                        docs = []
                        for filename in settings["knowledge_files"]:
                            file_path = os.path.join(f"knowledge/{user_id}/", filename)
                            if os.path.exists(file_path):
                                loader = TextLoader(file_path)
                                docs.extend(loader.load())
                        
                        if docs:
                            splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
                            chunks = splitter.split_documents(docs)
                            embeddings = OpenAIEmbeddings(openai_api_key=settings.get("api_key"))
                            vector_db = FAISS.from_documents(chunks, embeddings)
                            llm = OpenAI(openai_api_key=settings.get("api_key"))
        
        # Default to global knowledge if no conversation settings
        docs = vector_db.similarity_search(req.query, k=3)
        context = "\n".join([d.page_content for d in docs])
        prompt = f"根据以下内容回答问题：\n{context}\n\n问题：{req.query}"
        response = llm(prompt)
        return {"answer": response, "context": context}
    except Exception as e:
        return {"error": str(e)}, 500 