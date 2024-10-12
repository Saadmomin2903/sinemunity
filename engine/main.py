import modal
from modal import Stub, web_endpoint, Image, Secret
import os
import asyncio
import aiohttp
from typing import Dict, List
import logging
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
import requests
from fastapi import FastAPI, HTTPException
from functools import lru_cache

logging.basicConfig(level=logging.INFO)

image = modal.Image.debian_slim(python_version="3.10").pip_install(
    "pandas",
    "scikit-learn",
    "requests",
    "aiohttp",
    "fastapi",
)
stub = Stub(name="movie", image=image)

# Add a timeout to prevent requests from hanging indefinitely
TIMEOUT = aiohttp.ClientTimeout(total=60)  # 60 seconds

@stub.function(secrets=[modal.Secret.from_name("tmdb_key")])
@web_endpoint(label="all", method="POST")
async def fetch_all_movies() -> List[Dict]:
    # This function remains unchanged
    # ... [previous implementation]

@lru_cache(maxsize=1)
def get_movie_dataframe():
    all_movies_response = requests.post("https://saadmomin2903--all.modal.run/")
    all_movies_data = all_movies_response.json()
    df = pd.DataFrame(all_movies_data)
    df["overview"] = df["overview"].fillna("")
    return df

@lru_cache(maxsize=1)
def get_cosine_sim():
    df = get_movie_dataframe()
    tfidf = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf.fit_transform(df["overview"])
    return linear_kernel(tfidf_matrix, tfidf_matrix)

@stub.function()
@web_endpoint(label="reco", method="POST")
async def get_reco(data: Dict):
    title = data.get('title')
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    try:
        df = get_movie_dataframe()
        cosine_sim = get_cosine_sim()
        indices = pd.Series(df.index, index=df["title"]).drop_duplicates()

        if len(title.split()) == 1:
            matched_movies = df[df["title"].str.contains(title, case=False)]["title"].tolist()
            if not matched_movies:
                raise HTTPException(status_code=404, detail="No matching movies found")
            return {"recommendations": matched_movies[:15]}
        
        if title not in indices:
            raise HTTPException(status_code=404, detail="Movie not found")
        
        idx = indices[title]
        sim_scores = sorted(enumerate(cosine_sim[idx]), key=lambda x: x[1], reverse=True)[1:16]
        movie_indices = [i[0] for i in sim_scores]
        recommended_movies = df.iloc[movie_indices]["title"].tolist()

        return {"recommendations": recommended_movies}

    except Exception as e:
        logging.error(f"Error getting recommendations: {e}")
        return {"recommendations": []}