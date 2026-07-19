import os
from sentence_transformers import SentenceTransformer, util
import torch
import numpy as np
from typing import List, Dict, Any

class SemanticEngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SemanticEngine, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Loads the sentence-transformers model. We use all-MiniLM-L6-v2 for fast, high-quality semantic matching."""
        # Check if we should mock for testing/fast startup
        self.mock_mode = os.environ.get("MOCK_AI", "false").lower() == "true"
        if not self.mock_mode:
            try:
                # Load the model directly. This downloads it if not cached (~80MB).
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
            except Exception as e:
                print(f"Warning: Could not load SentenceTransformer model. Falling back to mock mode. Error: {e}")
                self.mock_mode = True

    def get_embedding(self, text: str) -> List[float]:
        """Generates a dense vector embedding for the input text."""
        if self.mock_mode:
            # Return random vector of dimension 384 (size of MiniLM)
            return np.random.rand(384).tolist()
        
        # We use convert_to_tensor=False to return numpy arrays which are easier to serialize
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding.tolist()

    def calculate_similarity(self, source_text: str, target_texts: List[str]) -> List[float]:
        """Calculates Cosine Similarity between a source text (e.g., JD) and multiple targets (e.g., Resumes)."""
        if self.mock_mode:
            return [np.random.uniform(0.5, 0.99) for _ in target_texts]
            
        source_embedding = self.model.encode(source_text, convert_to_tensor=True)
        target_embeddings = self.model.encode(target_texts, convert_to_tensor=True)
        
        # util.cos_sim returns a matrix of shape (len(source), len(targets))
        # Since we have 1 source, it's (1, N). We extract the first row and convert to CPU list.
        cosine_scores = util.cos_sim(source_embedding, target_embeddings)[0]
        return cosine_scores.cpu().tolist()

    def smart_search(self, query: str, candidate_documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Executes a semantic search over candidate documents.
        candidate_documents should be a list of dicts, each with a 'text' key.
        """
        if not candidate_documents:
            return []
            
        texts = [doc.get("text", "") for doc in candidate_documents]
        scores = self.calculate_similarity(query, texts)
        
        # Attach scores and sort
        results = []
        for i, doc in enumerate(candidate_documents):
            scored_doc = doc.copy()
            scored_doc["semantic_score"] = float(scores[i]) * 100 # Convert to percentage
            results.append(scored_doc)
            
        # Sort descending by score
        results.sort(key=lambda x: x["semantic_score"], reverse=True)
        return results

# Expose a singleton instance
semantic_engine = SemanticEngine()
