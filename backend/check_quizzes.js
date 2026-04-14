const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'documentation', 'sensors');

function parseQuizFromMarkdown(content) {
    const quizSectionMatch = content.match(/## AI Assessment Questions[^]*?(?=(?:## )|$)/i);
    if (!quizSectionMatch) return 0;
    
    let count = (quizSectionMatch[0].match(/\*\*(Q\d+:)/g) || []).length;
    return count;
}

const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md') && f !== 'Hardware_Pinout.md');
for (const file of files) {
    const content = fs.readFileSync(path.join(docsDir, file), 'utf8');
    const qCount = parseQuizFromMarkdown(content);
    if (qCount < 3) {
        console.log(`[NEEDS FIX] ${file} has ${qCount} questions`);
    } else {
        console.log(`[OK] ${file} has ${qCount} questions`);
    }
}
