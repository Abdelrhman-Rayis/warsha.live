import json

file_path = '/Users/rayis/Documents/Mazin/learning-platform/data/workshops.json'

with open(file_path, 'r') as f:
    data = json.load(f)

# 1. Remove "Facilitation Skills for Workshop Hosts"
# 2. Extract "Foundation of AI Agentic Engineering"
ai_course = None
filtered_data = []

for w in data:
    if w.get('title') == 'Facilitation Skills for Workshop Hosts':
        continue
    if w.get('title') == 'Foundation of AI Agentic Engineering':
        ai_course = w
        continue
    filtered_data.append(w)

# 3. Insert "Foundation of AI Agentic Engineering" at the beginning
if ai_course:
    filtered_data.insert(0, ai_course)

with open(file_path, 'w') as f:
    json.dump(filtered_data, f, indent=2)

print("Updated workshops.json successfully.")
