const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('page.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src/app');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('<DashboardLayout>')) {
    content = content.replace(/import\s+\{[^}]*DashboardLayout[^}]*\}\s+from\s+["'][^"']+["'];?\r?\n?/g, '');
    content = content.replace(/<DashboardLayout>/g, '<>');
    content = content.replace(/<\/DashboardLayout>/g, '</>');
    fs.writeFileSync(f, content);
    console.log('Updated', f);
  }
});
