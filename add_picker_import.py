with open("src/App.jsx", "r") as f:
    content = f.read()

if "WheelPicker" not in content:
    content = content.replace("import Strands from './components/Strands';", "import Strands from './components/Strands';\nimport WheelPicker from './components/WheelPicker';")
    with open("src/App.jsx", "w") as f:
        f.write(content)
    print("Added WheelPicker import.")
else:
    print("WheelPicker already imported.")
