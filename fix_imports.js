const fs = require('fs');
const path = require('path');

const sensorsDir = path.join(__dirname, 'frontend/src/app/sensors');
const dirs = fs.readdirSync(sensorsDir, { withFileTypes: true });

for (const dir of dirs) {
    if (dir.isDirectory()) {
        const pagePath = path.join(sensorsDir, dir.name, 'page.tsx');
        if (fs.existsSync(pagePath)) {
            let content = fs.readFileSync(pagePath, 'utf-8');

            const importStmt = 'import { SENSOR_QUIZZES } from "@/config/quizzes";';
            
            if (!content.includes('SENSOR_QUIZZES } from "@/config/quizzes"')) {
                // Find the last import
                const lastImportIndex = content.lastIndexOf('import ');
                if (lastImportIndex !== -1) {
                    const nextLineIndex = content.indexOf('\n', lastImportIndex);
                    if (nextLineIndex !== -1) {
                        content = content.substring(0, nextLineIndex + 1) + importStmt + '\n' + content.substring(nextLineIndex + 1);
                        fs.writeFileSync(pagePath, content);
                        console.log(`Added import to ${dir.name}`);
                    }
                }
            } else {
                console.log(`Already has import in ${dir.name}`);
            }
        }
    }
}
console.log("Import fix complete!");
