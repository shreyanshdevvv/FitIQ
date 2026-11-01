import re
from typing import List, Dict

class DocumentChunker:
    def __init__(self, chunk_size: int = 500, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def split_markdown(self, filename: str, content: str) -> List[Dict]:
        """
        Splits markdown documents into semantically coherent chunks based on
        sections (## headers) and paragraphs.
        """
        chunks: List[Dict] = []
        
        # Split by level 2 headings
        sections = re.split(r'\n(?=##\s+)', content)
        doc_title = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        main_title = doc_title.group(1) if doc_title else filename.replace('.md', '').replace('_', ' ').title()

        chunk_idx = 0
        for section in sections:
            section = section.strip()
            if not section:
                continue

            # Extract section heading
            heading_match = re.search(r'^##\s+(.+)$', section, re.MULTILINE)
            section_title = heading_match.group(1) if heading_match else main_title

            # If section is small enough, keep as single chunk
            words = section.split()
            if len(words) <= self.chunk_size:
                chunks.append({
                    "source_file": filename,
                    "chunk_index": chunk_idx,
                    "title": f"{main_title} > {section_title}",
                    "content": section,
                })
                chunk_idx += 1
            else:
                # Sub-split into overlapping windows
                start = 0
                while start < len(words):
                    end = start + self.chunk_size
                    chunk_text = " ".join(words[start:end])
                    chunks.append({
                        "source_file": filename,
                        "chunk_index": chunk_idx,
                        "title": f"{main_title} > {section_title} (Part {chunk_idx + 1})",
                        "content": chunk_text,
                    })
                    chunk_idx += 1
                    start += (self.chunk_size - self.overlap)

        return chunks

chunker = DocumentChunker()
