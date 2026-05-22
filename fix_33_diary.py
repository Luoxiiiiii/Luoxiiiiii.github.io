# fix_33_diary.py — Remove R-879-17 contaminating entries from R-879-33's diary
with open('c:/Users/Administrator/Desktop/网页游戏/js/data.js', 'r', encoding='utf-8') as f:
    data = f.read()

marker = "R-879-33"
idx = data.find(marker)
if idx < 0:
    print("ERROR: R-879-33 not found")
    exit(1)

# Find the diary array for R-879-33
diary_start = data.find("diary: [", idx)
if diary_start < 0:
    print("ERROR: diary array not found")
    exit(1)

# Find the end of the diary array
diary_end = data.find("]", diary_start)
if diary_end < 0:
    print("ERROR: diary end not found")
    exit(1)

# The contaminating entries are the last 5 entries before `] },`
# We need to find the boundary: after the '归属' entry and before '展台'
belong_entry = "{ date: '05/27', title: '归属'"
belong_idx = data.find(belong_entry, diary_start)
if belong_idx < 0:
    print("ERROR: 归属 entry not found")
    exit(1)

# Find the end of the 归属 entry line
belong_end = data.find("' },", belong_idx)
if belong_end < 0:
    print("ERROR: cannot find end of 归属 entry")
    exit(1)
belong_end += 4  # include ' },

# Now find the start of the '展台' contaminating entry
zhan_start = data.find("{ date: '05/22', title: '展台'", belong_end)
if zhan_start < 0:
    print("ERROR: contaminating 展台 entry not found")
    exit(1)

# Remove everything from 展台 to the end of the diary array (the ] before ] },)
# Actually, let's just find the ] that closes the diary array
# After the 归属 entry, the next entries are the contaminating ones, then ] then },
array_close = data.find("]", belong_end)
if array_close < 0:
    print("ERROR: array close not found")
    exit(1)

# Verify this ] is right before }, by checking what follows
after_close = data[array_close:array_close+10]
print(f"Content after array close: {repr(after_close)}")

# Remove from the contaminating start to array close
new_data = data[:belong_end] + data[array_close:]
# But this would leave the trailing whitespace between ] and the existing text
# Let's be more precise - remove exactly the contaminating entries and the newline before ]

# Actually, the structure is:
#   ... '归属' entry line,
#   contaminating entry 1,
#   contaminating entry 2,
#   ...
#   contaminating entry 5,
# ]
# We want to keep the 归属 line and the comma before it, then jump to ]

# Let's just do a simple removal: everything between belong_end and array_close
import re

# Verify what we're removing
removed_text = data[belong_end:array_close]
print(f"Removing text: {repr(removed_text[:100])}...")

# Rebuild
new_data = data[:belong_end] + "\n      " + data[array_close:]

# Write back
with open('c:/Users/Administrator/Desktop/网页游戏/js/data.js', 'w', encoding='utf-8') as f:
    f.write(new_data)

print("Done! R-879-33 diary cleaned.")
