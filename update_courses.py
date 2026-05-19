import json
import os
from datetime import datetime

file_path = '/Users/rayis/Documents/Mazin/learning-platform/data/workshops.json'

with open(file_path, 'r') as f:
    data = json.load(f)

for w in data:
    if w.get('instructor') == 'Abdelrhman Rayis':
        w['price'] = 0

new_course = {
    "id": "wksh-ai-agentic",
    "title": "Foundation of AI Agentic Engineering",
    "description": "Learn to design, build, and deploy autonomous AI agents capable of reasoning, using tools, and orchestrating complex workflows.",
    "instructor": "Abdelrhman Rayis",
    "price": 0,
    "currency": "usd",
    "duration": "6 weeks",
    "startDate": "2026-06-01",
    "avatar": "https://api.dicebear.com/9.x/initials/svg?seed=Abdelrhman%20Rayis&radius=50&size=120&backgroundType=gradientLinear",
    "enrolled": [],
    "liveClassId": None,
    "createdAt": datetime.utcnow().isoformat() + 'Z',
    "category": "AI"
}

data.append(new_course)

with open(file_path, 'w') as f:
    json.dump(data, f, indent=2)

print("Updated workshops.json successfully.")
