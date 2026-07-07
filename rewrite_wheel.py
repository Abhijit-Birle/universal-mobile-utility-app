with open("src/components/WheelPicker.jsx", "r") as f:
    content = f.read()

content = content.replace("export default function WheelPicker({ items, value, onChange, width = 80, label = \"\" }) {", "export default function WheelPicker({ items, value, onChange, width = 80, label = \"\", disabled = false }) {")

new_effect = """  useEffect(() => {
    if (containerRef.current) {
      const idx = items.indexOf(value);
      if (idx !== -1) {
        // If disabled (running), scroll smoothly
        if (disabled) {
           containerRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
        } else {
           containerRef.current.scrollTop = idx * ITEM_HEIGHT;
        }
      }
    }
  }, [value, items, disabled]);"""

content = content.replace("""  useEffect(() => {
    if (containerRef.current) {
      const idx = items.indexOf(value);
      if (idx !== -1) {
        containerRef.current.scrollTop = idx * ITEM_HEIGHT;
      }
    }
  }, [items]); // Removed value from dep array so it only centers on mount or items change, not on active scroll.""", new_effect)

content = content.replace("style={{ \n          height: \"100%\", overflowY: \"auto\", scrollSnapType: \"y mandatory\", position: \"relative\", zIndex: 1 \n        }}", "style={{ \n          height: \"100%\", overflowY: \"auto\", scrollSnapType: \"y mandatory\", position: \"relative\", zIndex: 1, pointerEvents: disabled ? 'none' : 'auto'\n        }}")

with open("src/components/WheelPicker.jsx", "w") as f:
    f.write(content)
