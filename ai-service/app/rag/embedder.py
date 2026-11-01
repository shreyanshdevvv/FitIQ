import hashlib
import asyncio
import numpy as np
from typing import List
from google import genai
from google.genai import types
from app.config import settings

class Embedder:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.EMBEDDING_MODEL
        self.dimension = 768
        is_valid_key = bool(self.api_key and not self.api_key.startswith("your-gemini"))
        self.client = genai.Client(api_key=self.api_key) if is_valid_key else None

    async def embed_text(self, text: str) -> List[float]:
        vectors = await self.embed_batch([text])
        return vectors[0]

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if self.client:
            try:
                vectors = []
                for t in texts:
                    res = await asyncio.wait_for(
                        self.client.aio.models.embed_content(
                            model=self.model,
                            contents=t,
                            config=types.EmbedContentConfig(output_dimensionality=self.dimension)
                        ),
                        timeout=30.0
                    )
                    vectors.append(list(res.embeddings[0].values))
                return vectors
            except Exception as e:
                print(f"⚠️ Gemini Embedding error: {e}. Using deterministic 768d unit embedding.")

        # Deterministic 768-dimensional unit embeddings for fallback
        return [self._generate_pseudo_embedding(t) for t in texts]

    def _generate_pseudo_embedding(self, text: str) -> List[float]:
        h = hashlib.sha256(text.encode('utf-8')).hexdigest()
        seed = int(h[:8], 16)
        rng = np.random.default_rng(seed)
        vec = rng.standard_normal(self.dimension)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

embedder = Embedder()
