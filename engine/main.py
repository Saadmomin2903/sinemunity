import modal
from modal import Stub, web_endpoint, Image, Secret
import os
import asyncio
import aiohttp
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
import requests
from fastapi import FastAPI, HTTPException
import logging
from typing import Dict, List

# Configure logging
logging.basicConfig(level=logging.INFO)

# Create modal image with necessary dependencies
image = modal.Image.debian_slim(python_version="3.10").pip_install(
    "pandas", "scikit-learn", "requests", "aiohttp", "fastapi"
)

# Create stub
stub = Stub(name="movie", image=image)

# Define timeout for aiohttp client
TIMEOUT = aiohttp.ClientTimeout(total=60)  # 60 seconds

# Global variables for caching the dataframe and cosine similarity matrix
movie_df = None
cosine_sim_matrix = None

@stub.function(secrets=[modal.Secret.from_name("tmdb_key")])
@web_endpoint(label="all", method="POST")
async def fetch_all_movies() -> List[Dict]:
    BASE_URL = "https://api.themoviedb.org/3"
    MAX_PAGES = 500
    endpoint = "/discover/movie"
    params = {
        "api_key": os.environ["tmdb_key"],
        "language": "en-US",
        "sort_by": "popularity.desc",
        "include_adult": "false",
        "include_video": "false",
        "page": 1,
    }
    all_movies = []

    async with aiohttp.ClientSession(timeout=TIMEOUT) as session:
        while params["page"] <= MAX_PAGES:
            try:
                async with session.get(BASE_URL + endpoint, params=params) as response:
                    response.raise_for_status()
                    data = await response.json()
                    if "results" not in data:
                        logging.error(f"Unexpected response format: {data}")
                        break
                    all_movies.extend(data["results"])
                    if params["page"] >= data["total_pages"]:
                        break
                    params["page"] += 1
            except aiohttp.ClientError as e:
                logging.error(f"Error fetching movies: {e}")
                break
            except Exception as e:
                logging.error(f"Unexpected error: {e}")
                break

    return all_movies

async def update_movie_data():
    """Periodically refresh the movie dataframe and cosine similarity matrix."""
    global movie_df, cosine_sim_matrix

    while True:
        try:
            logging.info("Fetching new movie data...")
            all_movies_response = requests.post("https://saadmomin2903--all.modal.run/")
            all_movies_response.raise_for_status()
            all_movies_data = all_movies_response.json()

            # Update the dataframe
            movie_df = pd.DataFrame(all_movies_data)
            movie_df["overview"] = movie_df["overview"].fillna("")
            movie_df["content"] = movie_df["title"] + " " + movie_df["overview"]

            # Recompute the cosine similarity matrix
            tfidf = TfidfVectorizer(stop_words="english")
            tfidf_matrix = tfidf.fit_transform(movie_df["content"])
            cosine_sim_matrix = linear_kernel(tfidf_matrix, tfidf_matrix)

            logging.info("Movie data and similarity matrix updated.")
        except Exception as e:
            logging.error(f"Error updating movie data: {e}")

        # Wait for 1 hour before refreshing again
        await asyncio.sleep(3600)

@stub.function()
@web_endpoint(label="reco", method="POST")
async def get_reco(data: Dict):
    title = data.get("title")
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    global movie_df, cosine_sim_matrix

    if movie_df is None or cosine_sim_matrix is None:
        raise HTTPException(status_code=503, detail="Data is not yet loaded. Please try again later.")

    try:
        # Find the closest matching movie(s) by title
        indices = pd.Series(movie_df.index, index=movie_df["title"]).drop_duplicates()

        if len(title.split()) == 1:
            matched_movies = movie_df[movie_df["title"].str.contains(title, case=False)]["title"].tolist()
            if not matched_movies:
                raise HTTPException(status_code=404, detail="No matching movies found")
            return {"recommendations": matched_movies[:15]}

        if title not in indices:
            raise HTTPException(status_code=404, detail="Movie not found")

        # Get the index and compute recommendations
        idx = indices[title]
        sim_scores = sorted(enumerate(cosine_sim_matrix[idx]), key=lambda x: x[1], reverse=True)[1:16]
        movie_indices = [i[0] for i in sim_scores]
        recommended_movies = movie_df.iloc[movie_indices]["title"].tolist()

        return {"recommendations": recommended_movies}

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting recommendations: {e}")
        raise HTTPException(status_code=500, detail="Error processing recommendation request")

# Start the background task to periodically update movie data
@stub.function()
async def start_data_update():
    asyncio.create_task(update_movie_data())
