const fs = require('fs');
const path = require('path');

const sensorsDir = path.join(__dirname, 'src', 'app', 'sensors');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (file === 'page.tsx') {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Regex to match the button content inside setShowQuiz(true) button
            // It looks for <Brain ... /> then any text until </button>
            const regex = /(<button[^>]*onClick=\{\(\)\s*=>\s*setShowQuiz\(true\)\}[^>]*>[\s\S]*?<Brain[^>]*>)\s*([\s\S]*?)\s*(<\/button>)/g;
            
            const newContent = content.replace(regex, '$1 Test Knowledge$3');
            
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDir(sensorsDir);
console.log('Done replacing button texts.');
