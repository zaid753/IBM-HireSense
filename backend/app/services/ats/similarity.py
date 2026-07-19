from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.services.ats.nlp_utils import clean_and_lemmatize

class BaseScorer:
    def calculate_similarity(self, text1: str, text2: str) -> float:
        raise NotImplementedError

class TFIDFScorer(BaseScorer):
    def __init__(self):
        self.vectorizer = TfidfVectorizer()

    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculates cosine similarity between two texts using TF-IDF."""
        cleaned_text1 = clean_and_lemmatize(text1)
        cleaned_text2 = clean_and_lemmatize(text2)
        
        if not cleaned_text1 or not cleaned_text2:
            return 0.0
            
        try:
            tfidf_matrix = self.vectorizer.fit_transform([cleaned_text1, cleaned_text2])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity * 100) # Return as percentage 0-100
        except Exception:
            return 0.0

# Future-proofing: We can swap TFIDFScorer with SentenceTransformerScorer easily
default_scorer = TFIDFScorer()
