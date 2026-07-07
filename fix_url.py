import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# Replace url={ytLink} with url={ytLink.startsWith('http') ? ytLink : `https://${ytLink}`}
content = content.replace("url={ytLink}", "url={ytLink.startsWith('http') ? ytLink : `https://${ytLink}`}")

with open("src/App.jsx", "w") as f:
    f.write(content)
