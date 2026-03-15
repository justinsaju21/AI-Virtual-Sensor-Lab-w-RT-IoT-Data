const fs = require('fs');
const path = require('path');

const sensorsDir = path.join(__dirname, 'frontend/src/app/sensors');
const dirs = fs.readdirSync(sensorsDir, { withFileTypes: true });

for (const dir of dirs) {
    if (dir.isDirectory()) {
        const pagePath = path.join(sensorsDir, dir.name, 'page.tsx');
        if (fs.existsSync(pagePath)) {
            let content = fs.readFileSync(pagePath, 'utf-8');

            // Find all indices of 'const EXPERIMENTS = ['
            let parts = content.split('const EXPERIMENTS = [');
            if (parts.length > 2) {
                // It's defined multiple times.
                // The new comprehensive one is the first one (after THEORY).
                // The old dummy one is the second one (usually after ARDUINO_CODE).
                
                // Let's use string manipulation to remove the SECOND occurrence and everything up to its closing '];'
                let firstPart = parts[0];
                let secondPart = parts[1];
                let thirdPart = parts[2];
                
                // The thirdPart starts with the contents of the second EXPERIMENTS array.
                // We need to find the closing '];' in thirdPart.
                let closingIndex = thirdPart.indexOf('];');
                if (closingIndex !== -1) {
                    // Reconstruct content without the second EXPERIMENTS block
                    thirdPart = thirdPart.substring(closingIndex + 2);
                    
                    content = firstPart + 'const EXPERIMENTS = [' + secondPart + thirdPart;
                }
            }

            // Do the same for COMMON_MISTAKES
            let mistakeParts = content.split('const COMMON_MISTAKES = [');
            if (mistakeParts.length > 2) {
                let firstPart = mistakeParts[0];
                let secondPart = mistakeParts[1];
                let thirdPart = mistakeParts[2];
                
                let closingIndex = thirdPart.indexOf('];');
                if (closingIndex !== -1) {
                    thirdPart = thirdPart.substring(closingIndex + 2);
                    content = firstPart + 'const COMMON_MISTAKES = [' + secondPart + thirdPart;
                }
            }

            fs.writeFileSync(pagePath, content);
            console.log(`Cleaned duplicates in ${dir.name}`);
        }
    }
}
console.log("Cleanup complete!");
