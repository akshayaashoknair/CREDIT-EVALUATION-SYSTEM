import pdfplumber

def extract_text_from_pdf(file_path: str) -> str:
    text_content = []

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_content.append(page_text)

    return "\n".join(text_content)
