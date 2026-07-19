import os
import fitz  # PyMuPDF
import pdfplumber
import docx
from fastapi import HTTPException
from loguru import logger

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF using PyMuPDF, fallback to pdfplumber."""
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text("text") + "\n"
        doc.close()
    except Exception as e:
        logger.warning(f"PyMuPDF failed on {file_path}, falling back to pdfplumber. Error: {e}")
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as fallback_e:
            logger.error(f"pdfplumber also failed on {file_path}. Error: {fallback_e}")
            raise HTTPException(status_code=422, detail="Unable to read PDF file. It might be corrupted or encrypted.")
    
    if not text.strip():
        raise HTTPException(status_code=422, detail="Extracted text is empty. The PDF might contain only images.")
        
    return text

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from a DOCX file."""
    try:
        doc = docx.Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        logger.error(f"Failed to read DOCX file {file_path}. Error: {e}")
        raise HTTPException(status_code=422, detail="Unable to read DOCX file. It might be corrupted.")

def extract_text(file_path: str) -> str:
    """Identify file type and extract text."""
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found.")
        
    ext = file_path.lower().split('.')[-1]
    if ext == 'pdf':
        return extract_text_from_pdf(file_path)
    elif ext == 'docx':
        return extract_text_from_docx(file_path)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file format: {ext}")
