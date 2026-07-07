with open("src/App.jsx", "r") as f:
    content = f.read()

if "Hourglass" not in content:
    content = content.replace("AlarmClock,", "AlarmClock,\n  Hourglass,")
    with open("src/App.jsx", "w") as f:
        f.write(content)
    print("Added Hourglass")
