import re
import spacy

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    nlp = None

def clean_and_lemmatize(text: str) -> str:
    """
    Cleans text by converting to lowercase, removing punctuation, 
    removing stopwords, and lemmatizing words.
    Keeps technical keywords intact.
    """
    if not text:
        return ""
        
    text = text.lower()
    # Remove special characters but keep alphanumeric and common tech symbols (+, #)
    text = re.sub(r'[^a-z0-9\+#\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()

    if nlp:
        doc = nlp(text)
        # Filter out stopwords and punctuation, then lemmatize
        tokens = [
            token.lemma_ for token in doc 
            if not token.is_stop and not token.is_punct and len(token.lemma_) > 1
        ]
        return " ".join(tokens)
        
    return text
