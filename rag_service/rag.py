import os
# Force disable telemetry before importing chromadb
os.environ["CHROMA_ANONYMIZED_TELEMETRY"] = "False"

import chromadb
from google import genai
from google.genai import types
from chromadb.utils import embedding_functions
from chromadb.config import Settings
import time

from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("❌ WARNING: No API Key found in environment variables (GEMINI_API_KEY or GOOGLE_API_KEY).")
else:
    print(f"✅ API Key found: {api_key[:4]}...{api_key[-4:]}")

client = genai.Client(api_key=api_key)

# Configure ChromaDB
# Persistent client
chroma_client = chromadb.PersistentClient(path="chroma_db", settings=Settings(anonymized_telemetry=False))

# Embedding function
# default is SentenceTransformer, but we want Gemini if possible or a good default
# For simplicity and free tier, we can use the default all-MiniLM-L6-v2 which Chroma handles downloading
# OR use google_generativeai_embedding if we want better quality but it requires setup.
# Let's stick to default for now for simplicity, or use `google.generativeai.embed_content` manually.
# Actually, let's use a custom embedding function wrapping Gemini to keep it consistent.

class GeminiEmbeddingFunction(chromadb.EmbeddingFunction):
    def __call__(self, input: chromadb.Documents) -> chromadb.Embeddings:
        model = "models/gemini-embedding-001"
        return [
            client.models.embed_content(
                model=model,
                contents=str(text),
                config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT", title="RAG Document")
            ).embeddings[0].values
            for text in input
        ]

# Create collection
collection = chroma_client.get_or_create_collection(
    name="landing_page_docs_v2",
    embedding_function=GeminiEmbeddingFunction() # or default if this is too complex
)

def reset_db_internal():
    try:
        chroma_client.delete_collection("landing_page_docs_v2")
        global collection
        collection = chroma_client.get_or_create_collection(
            name="landing_page_docs_v2",
            embedding_function=GeminiEmbeddingFunction()
        )
        return True
    except Exception as e:
        print(f"❌ Reset Internal Error: {e}")
        raise

def add_documents(documents, ids):
    collection.add(documents=documents, ids=ids)

def query_rag(query_text, n_results=3):
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results
    )
    return results

# Renamed to make it importable if needed, though simple function is fine
def get_gemini_response(query_text, context_text, history=None):
    model = 'models/gemini-2.5-flash' 
    
    # Format history for prompt
    history_text = ""
    if history:
        history_text = "Previous conversation history:\n"
        for msg in history:
            role = "User" if msg.get('role') == 'user' else "Assistant"
            history_text += f"{role}: {msg.get('content')}\n"
    
    prompt = f"""
    You are a helpful AI assistant for a landing page.
    Answer the user's question based on the provided context and conversation history.
    If the answer is not in the context, say "I don't have enough information to answer that."
    
    {history_text}
    
    Context:
    {context_text}
    
    Question:
    {query_text}
    """
    
    try:
        # Use generate_content with stream=True
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                # Ensure we get a stream
            )
        )
        # Note: In some SDK versions, it's response.text for non-streaming
        # For streaming, we iterate over the response
        
        # If we want to return a generator:
        def generate():
            # The SDK might behave differently depending on version. 
            # If it's the newer genai SDK, we use generate_content_stream or similar.
            # But the client.models.generate_content usually returns a single response unless specified.
            # Let's check how the user wants to stream. 
            # For now, I'll implement a simple generator that yields the response and then I'll refine for true streaming.
            
            # Re-fetch with stream=True if supported
            # Actually, standard generate_content is fine for now if we want to just "sim" streaming or if the SDK supports it.
            # Let's use the actual streaming if possible.
            try:
                # Based on the user's requirement for "smooth streaming", I'll try to find the streaming method.
                for chunk in client.models.generate_content_stream(model='models/gemini-2.5-flash', contents=prompt):
                   if chunk.text:
                       yield chunk.text
            except Exception as e:
                # Fallback to non-streaming if method doesn't exist or fails
                print(f"Streaming failed, falling back to non-streaming: {e}")
                res = client.models.generate_content(model='models/gemini-2.5-flash', contents=prompt)
                yield res.text

        return generate()
        
    except Exception as e:
        # Use repr(e) to avoid potential crashes in exception string conversion
        print(f"❌ Gemini Error: {repr(e)}")
        raise


if __name__ == "__main__":
    print("RAG Module Initialized")
