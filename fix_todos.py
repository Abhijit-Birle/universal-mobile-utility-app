import re

with open("src/App.jsx", "r") as f:
    content = f.read()

content = re.sub(r'    // Linked todo\n    const LINKABLE_TODOS = \["Send client project report", "Revise chapter 4 notes for exam", "Buy groceries"\];\n', '', content)
content = content.replace('{LINKABLE_TODOS.map((td) => (', '{todos.map((td) => (')
content = content.replace('active={linkedTodo === td}', 'active={linkedTodo === td.id}')
content = content.replace('onClick={() => setLinkedTodo(td)}', 'onClick={() => setLinkedTodo(td.id)}')
content = content.replace('label={td}', 'label={td.text}')

with open("src/App.jsx", "w") as f:
    f.write(content)
