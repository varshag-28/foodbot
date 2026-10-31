const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");

const welcomeHTML = chat.innerHTML;   // remembered so "New chat" can restore it

// ---------- helpers ----------
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;   // textContent keeps user input safe
    return node;
}

function scrollToBottom() {
    chat.scrollTop = chat.scrollHeight;
}

function selectedDiet() {
    return document.querySelector('input[name="diet"]:checked').value;
}

function addUserMessage(text) {
    chat.appendChild(el("div", "msg user", text));
    scrollToBottom();
}

function addBotMessage(text) {
    chat.appendChild(el("div", "msg bot", text));
    scrollToBottom();
}

function addTyping() {
    const box = el("div", "msg bot");
    const dots = el("div", "typing");
    dots.append(el("span"), el("span"), el("span"));
    box.appendChild(dots);
    chat.appendChild(box);
    scrollToBottom();
    return box;
}

// ---------- recipe cards ----------
function userWords(message) {
    return message.toLowerCase().split(/[^a-z]+/).filter(Boolean);
}

function buildCard(recipe, words, isTop) {
    const card = el("div", "recipe-card" + (isTop ? " top" : ""));

    const head = el("div", "recipe-head");
    const isVeg = recipe.diet === "Vegetarian";
    head.append(el("span", "diet-dot " + (isVeg ? "veg" : "nonveg")), el("h3", "", recipe.name));
    card.appendChild(head);

    const badges = el("div", "badges");
    if (isTop) badges.appendChild(el("span", "badge best", "Best match"));
    badges.append(el("span", "badge", recipe.category), el("span", "badge", recipe.diet));
    card.appendChild(badges);

    const tags = el("div", "tags");
    recipe.ingredients.split(",").map(s => s.trim()).filter(Boolean).forEach(item => {
        const matched = words.some(w => w.length > 2 && item.toLowerCase().includes(w));
        tags.appendChild(el("span", "tag" + (matched ? " hit" : ""), item));
    });
    card.appendChild(tags);

    const row = el("div", "match-row");
    const bar = el("div", "bar");
    const fill = el("span");
    fill.style.width = Math.min(recipe.score, 100) + "%";
    bar.appendChild(fill);
    row.append(el("span", "", "Match"), bar, el("strong", "", Math.round(recipe.score) + "%"));
    card.appendChild(row);

    return card;
}

function showRecipes(recipes, message) {
    const useful = recipes.filter(r => r.score > 0);
    if (useful.length === 0) {
        addBotMessage("I couldn't find a close match. Try other ingredients (for example 'chicken, rice') or change the diet filter.");
        return;
    }
    const words = userWords(message);
    const box = el("div", "msg bot results");
    box.appendChild(el("p", "results-title", "🍽️ Here's what you could cook:"));
    const grid = el("div", "recipe-grid");
    useful.forEach((r, i) => grid.appendChild(buildCard(r, words, i === 0)));
    box.appendChild(grid);
    box.appendChild(el("p", "hint", "Green ingredients are the ones you mentioned."));
    chat.appendChild(box);
    scrollToBottom();
}

// ---------- main action ----------
async function sendMessage(textOverride) {
    const message = (typeof textOverride === "string" ? textOverride : input.value).trim();
    if (!message) {
        input.focus();
        return;
    }

    addUserMessage(message);
    input.value = "";
    sendBtn.disabled = true;
    const typing = addTyping();

    try {
        const response = await fetch("/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message, diet: selectedDiet() })
        });
        const data = await response.json();
        typing.remove();

        if (data.error) {
            addBotMessage(data.error);
        } else {
            showRecipes(data.recommendations, message);
        }
    } catch (err) {
        typing.remove();
        addBotMessage("Sorry, something went wrong. Please check that the server is running and try again.");
    } finally {
        sendBtn.disabled = false;
        input.focus();
    }
}

// ---------- events ----------
sendBtn.addEventListener("click", () => sendMessage());

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});

chat.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) sendMessage(chip.dataset.text);
});

clearBtn.addEventListener("click", () => {
    chat.innerHTML = welcomeHTML;
    input.value = "";
    input.focus();
});