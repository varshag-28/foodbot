from flask import Flask, render_template, request, jsonify
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

# ------------------------------------------------
# Load recipe dataset
# ------------------------------------------------

df = pd.read_csv("recipes.csv")

# Combine recipe information
df["text"] = (
    df["name"].fillna("") + " " +
    df["ingredients"].fillna("") + " " +
    df["category"].fillna("") + " " +
    df["diet"].fillna("")
)

# ------------------------------------------------
# TF-IDF model
# ------------------------------------------------

vectorizer = TfidfVectorizer(
    stop_words="english"
)

recipe_vectors = vectorizer.fit_transform(df["text"])


# ------------------------------------------------
# Recommendation function
# ------------------------------------------------

def recommend_food(user_input, diet=None):

    user_input = user_input.lower()

    # Convert user input into TF-IDF vector
    user_vector = vectorizer.transform([user_input])

    # Calculate similarity
    similarity_scores = cosine_similarity(
        user_vector,
        recipe_vectors
    ).flatten()

    # Add scores to dataframe
    results = df.copy()
    results["score"] = similarity_scores

    # Dietary filtering
    if diet and diet != "Any":

        results = results[
            results["diet"].str.lower()
            == diet.lower()
        ]

    # Sort by similarity
    results = results.sort_values(
        by="score",
        ascending=False
    )

    # Select top 5
    results = results.head(5)

    recommendations = []

    for _, row in results.iterrows():

        recommendations.append({
            "name": row["name"],
            "ingredients": row["ingredients"],
            "category": row["category"],
            "diet": row["diet"],
            "score": round(float(row["score"]) * 100, 2)
        })

    return recommendations


# ------------------------------------------------
# Home page
# ------------------------------------------------

@app.route("/")
def home():
    return render_template("index.html")


# ------------------------------------------------
# Recommendation API
# ------------------------------------------------

@app.route("/recommend", methods=["POST"])
def recommend():

    data = request.get_json()

    user_input = data.get("message", "")
    diet = data.get("diet", "Any")

    if not user_input.strip():

        return jsonify({
            "error": "Please enter ingredients or food preferences."
        })

    recommendations = recommend_food(
        user_input,
        diet
    )

    return jsonify({
        "recommendations": recommendations
    })


# ------------------------------------------------
# Run application
# ------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True)