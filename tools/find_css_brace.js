const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'App.css');
const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
const stack = [];
let depth = 0;

for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
  const line = lines[lineIndex];
  for (let columnIndex = 0; columnIndex < line.length; columnIndex++) {
    const ch = line[columnIndex];
    if (ch === '{') {
      depth += 1;
      stack.push({ line: lineIndex + 1, column: columnIndex + 1 });
    } else if (ch === '}') {
      depth -= 1;
      stack.pop();
    }
  }
}

console.log(JSON.stringify({ depth, stack }, null, 2));
