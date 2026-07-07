with open("src/App.jsx", "r") as f:
    content = f.read()

start_marker = "        <SectionLabel>Add a task for today</SectionLabel>"
end_marker = "Tasks are auto-sorted into Work / Study / Personal based on what you type.\n        </div>"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker) + len(end_marker)

block = content[start_idx:end_idx] + "\n"

# Cut the block out
new_content = content[:start_idx] + content[end_idx:]

# Find the end of the groups map.
# Looking at the previous output, the map ends with:
#             </div>
#           </div>
#         ))}
#       </div>
#     );
#   }
# 
#   /* ---------------------------------- INSIGHTS TAB ---------------------------------- */

insert_target = "        ))}\n      </div>\n    );\n  }"

if insert_target in new_content:
    replacement = "        ))}\n\n" + block + "\n      </div>\n    );\n  }"
    new_content = new_content.replace(insert_target, replacement)
    
    with open("src/App.jsx", "w") as f:
        f.write(new_content)
    print("Successfully moved the block!")
else:
    print("Could not find insert target.")

