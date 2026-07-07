import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# Fix the broken ); \n, [theme]); 
content = re.sub(r'\);\n, \[theme\]\);', r'), [theme]);', content)
content = re.sub(r', \[theme\]\);, \[theme\]\);', r', [theme]);', content)

with open("src/App.jsx", "w") as f:
    f.write(content)
