# 🍴 FoodBot AI

A chat-style recipe recommendation web app. Enter the ingredients you have (or the kind of food you want), pick a diet preference, and FoodBot returns the five closest recipes with a match score.

Built with **Python, Flask, Pandas and scikit-learn**. Recommendations use **TF-IDF vectorization and cosine similarity**.

<!-- Add a screenshot of the app here, e.g. ![FoodBot AI screenshot](screenshot.png) -->

## Features

- Free-text input such as `rice, paneer and vegetables`
- Diet filter: Any, Vegetarian or Non-Vegetarian
- Top 5 ranked recipes, each with ingredients, category, diet and a match percentage
- Flask REST endpoint (`POST /recommend`) that accepts and returns JSON
- Chat-style interface built with HTML, CSS and JavaScript (Fetch API)

## How it works

1. `recipes.csv` is loaded with Pandas. Each recipe's name, ingredients, category and diet are combined into one text field.
2. A `TfidfVectorizer` (English stop words removed) turns every recipe into a TF-IDF vector when the app starts.
3. The user's input is converted into a vector with the same vectorizer.
4. Cosine similarity compares the input vector to every recipe vector.
5. If a diet is selected, recipes are filtered by diet. The top 5 by similarity score are returned.

## Tech stack

| Layer | Tools |
|-------|-------|
| Backend | Python, Flask |
| Data and ML | Pandas, scikit-learn (TfidfVectorizer, cosine similarity) |
| Frontend | HTML, CSS, JavaScript (Fetch API), Flask templates |
| Data | `recipes.csv` (15 recipes with name, ingredients, category, diet) |

## Project structure

```
foodbot/
├── app.py              # Flask app and recommendation logic
├── recipes.csv         # Recipe dataset
├── requirements.txt    # Python dependencies
├── templates/
│   └── index.html      # Chat interface
└── static/
    ├── script.js       # Sends requests to /recommend and renders results
    └── style.css       # Styling
```

## Getting started

```bash
# 1. Clone the repository
git clone https://github.com/varshag-28/foodbot.git
cd foodbot

# 2. (Optional) create a virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the app
python app.py
```

Open `http://127.0.0.1:5000` in your browser.

## API

### `POST /recommend`

Request body:

```json
{
  "message": "rice, paneer and vegetables",
  "diet": "Any"
}
```

`diet` can be `Any`, `Vegetarian` or `Non-Vegetarian`.

Example response (first three of five results shown):

```json
{
  "recommendations": [
    {
      "name": "Paneer Fried Rice",
      "ingredients": "rice, paneer, vegetables, onion, soy sauce",
      "category": "Indian",
      "diet": "Vegetarian",
      "score": 78.61
    },
    {
      "name": "Paneer Tikka",
      "ingredients": "paneer, yogurt, onion, capsicum, spices",
      "category": "Indian",
      "diet": "Vegetarian",
      "score": 46.02
    },
    {
      "name": "Paneer Butter Masala",
      "ingredients": "paneer, tomato, onion, butter, cream, spices",
      "category": "Indian",
      "diet": "Vegetarian",
      "score": 36.92
    }
  ]
}
```

If `message` is empty, the API returns `{"error": "Please enter ingredients or food preferences."}`.

## Limitations and future improvements

- The dataset is small (15 Indian recipes). Expanding it with more recipes and cuisines would improve the results.
- The match score is a TF-IDF cosine similarity, which reflects text similarity rather than a probability.
- Planned ideas: more diet categories, ingredient exclusion (for example allergies), recipe instructions and images, and an evaluation of how often an expected dish appears in the top 5.

## Author

**Varsha G** · [LinkedIn](https://www.linkedin.com/in/varsha-g-80037226) · [GitHub](https://github.com/varshag-28)
