import hashlib
import numpy as np
from typing import List
from openai import AsyncOpenAI
from app.config import settings

class Embedder:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.EMBEDDING_MODEL
        is_valid_key = bool(self.api_key and not self.api_key.startswith("your-openai"))
        self.client = AsyncOpenAI(api_key=self.api_key) if is_valid_key else None
        self.dimension = 1536

    async def embed_text(self, text: str) -> List[float]:
        vectors = await self.embed_batch([text])
        return vectors[0]

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if self.client:
            try:
                response = await self.client.embeddings.create(
                    model=self.model,
                    input=texts,
                )
                return [item.embedding for item in response.data]
            except Exception:
                pass

        # Deterministic offline unit embeddings for testing & offline development
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
