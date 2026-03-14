const fs = require('fs');
const content = fs.readFileSync('lint_utf8.json', 'utf8').replace(/^\uFEFF/, '');
const data = JSON.parse(content);

data.forEach(file => {
    if (file.errorCount > 0 || file.warningCount > 0) {
        console.log(`\nFile: ${file.filePath}`);
        file.messages.forEach(msg => {
            console.log(`  Line ${msg.line}:${msg.column} - ${msg.ruleId} - ${msg.message}`);
        });
    }
});
