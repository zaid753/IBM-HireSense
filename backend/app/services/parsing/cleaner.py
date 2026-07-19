import re

def clean_text(text: str) -> str:
    """Normalize whitespace, remove duplicate spaces, and blank lines."""
    # Replace weird unicode characters
    text = text.replace('\u2013', '-').replace('\u2014', '-')
    text = text.replace('\u2018', "'").replace('\u2019', "'")
    text = text.replace('\u201c', '"').replace('\u201d', '"')
    
    # Normalize tabs to spaces
    text = text.replace('\t', ' ')
    
    # Split lines, remove leading/trailing spaces from each line
    lines = [line.strip() for line in text.split('\n')]
    
    # Remove empty lines
    lines = [line for line in lines if line]
    
    # Rejoin with single newline
    cleaned_text = '\n'.join(lines)
    
    # Replace multiple spaces with a single space
    cleaned_text = re.sub(r' +', ' ', cleaned_text)
    
    return cleaned_text
