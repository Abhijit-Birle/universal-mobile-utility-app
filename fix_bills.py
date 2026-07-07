import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# 1. Remove hardcoded UPCOMING_BILLS
content = re.sub(r'  // Bill reminders\n  const UPCOMING_BILLS = \[\n.*?  \];\n', '', content, flags=re.DOTALL)

# 2. Fix bankBalance and cashBalance
content = re.sub(r'    const bankBalance = 14250.00;\n    const cashBalance = 340.50;\n', '', content)
# Wait, let's just do text replacements for balances
content = content.replace('₹{bankBalance.toLocaleString()}', '₹{balances.bank.toLocaleString()}')
content = content.replace('₹{cashBalance.toLocaleString()}', '₹{balances.cash.toLocaleString()}')

# 3. Replace UPCOMING_BILLS mapping
content = content.replace('{UPCOMING_BILLS.map((b) => (', '{upcomingBills.map((b) => (')

with open("src/App.jsx", "w") as f:
    f.write(content)
