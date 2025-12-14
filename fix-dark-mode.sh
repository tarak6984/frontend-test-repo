#!/bin/bash

# Fix Funds page - remove all the hardcoded text-white and resolvedTheme logic
# The issue is the page forces white text which is invisible on white backgrounds

echo "Fixing Funds page dark mode..."

# Remove all the conditional text-white classes
sed -i 's/resolvedTheme === "dark" ? "text-white" : "text-gray-900"/""/' frontend/src/app/\(dashboard\)/funds/page.tsx
sed -i 's/resolvedTheme === "dark" ? "text-white" : "text-gray-600"/""/' frontend/src/app/\(dashboard\)/funds/page.tsx  
sed -i 's/resolvedTheme === "dark" ? "text-white" : "text-gray-500"/""/' frontend/src/app/\(dashboard\)/funds/page.tsx
sed -i 's/className={\r$/className="/' frontend/src/app/\(dashboard\)/funds/page.tsx

# Remove inline style color overrides
sed -i 's/style={{ color: "white" }}//g' frontend/src/app/\(dashboard\)/funds/page.tsx
sed -i 's/style={{ color: "rgb(17, 24, 39)" }}//g' frontend/src/app/\(dashboard\)/funds/page.tsx

# Remove the pageStyle logic that forces light color scheme
sed -i '/const \[pageStyle, setPageStyle\] = useState/d' frontend/src/app/\(dashboard\)/funds/page.tsx
sed -i '/useEffect.*resolvedTheme/,/}, \[resolvedTheme\]);/d' frontend/src/app/\(dashboard\)/funds/page.tsx
sed -i 's/style={pageStyle}//g' frontend/src/app/\(dashboard\)/funds/page.tsx

echo "Done! The page should now use default Tailwind dark mode classes."
