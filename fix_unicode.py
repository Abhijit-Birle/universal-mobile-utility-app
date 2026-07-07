with open("src/App.jsx", "r") as f:
    content = f.read()

content = content.replace(r"\u20B9", "₹")
content = content.replace(r"\u2026", "…")
content = content.replace(r"\u00b7", "·")
content = content.replace(r"\u26A0", "⚠")

with open("src/App.jsx", "w") as f:
    f.write(content)

