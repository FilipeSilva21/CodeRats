const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  // Backgrounds
  { regex: /bg-\[\#0d1117\]/g, replace: 'bg-cr-bg' },
  { regex: /bg-\[\#161b22\]/g, replace: 'bg-cr-surface' },
  { regex: /bg-\[\#24292e\]/g, replace: 'bg-cr-surface-hover' },
  
  // Borders
  { regex: /border-\[\#0d1117\]/g, replace: 'border-cr-bg' },
  { regex: /border-\[\#161b22\]/g, replace: 'border-cr-surface' },
  { regex: /border-\[\#30363d\]/g, replace: 'border-cr-border' },
  { regex: /divide-\[\#30363d\]/g, replace: 'divide-cr-border' },

  // Text colors
  { regex: /text-\[\#c9d1d9\]/g, replace: 'text-cr-text' },
  { regex: /text-white/g, replace: 'text-cr-text-bold' },
  { regex: /text-gray-400/g, replace: 'text-cr-text-muted' },
  { regex: /text-gray-500/g, replace: 'text-cr-text-subtle' },
  { regex: /text-gray-300/g, replace: 'text-cr-text-muted' },
  { regex: /text-gray-200/g, replace: 'text-cr-text' },
  { regex: /text-gray-600/g, replace: 'text-cr-text-subtle' },
  { regex: /text-black/g, replace: 'text-cr-text-inverse' }, // Buttons usually
];

walkDir(srcDir, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Fix layout body hardcoded text
    if (filePath.includes('layout.tsx')) {
      content = content.replace('bg-[#0d1117] text-[#c9d1d9]', 'bg-cr-bg text-cr-text transition-colors duration-200');
    }

    replacements.forEach(({ regex, replace }) => {
      content = content.replace(regex, replace);
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
