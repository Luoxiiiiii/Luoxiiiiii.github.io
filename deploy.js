// deploy.js — 自动更新版本号 + git 提交推送
// 用法: node deploy.js

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const now = new Date();
const version = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;

// 读取 index.html，替换版本号
let html = fs.readFileSync(indexPath, 'utf8');
const replaced = html.replace(/(\?v=)[\d.]+/g, `$1${version}`);

if (html === replaced) {
  console.log('⚠️  index.html 中未找到 ?v= 版本号，请确认格式是否正确');
  process.exit(1);
}

fs.writeFileSync(indexPath, replaced, 'utf8');
console.log(`✓ 版本号已更新为 ${version}`);

// git 操作
try {
  // 暂存版本号变更
  console.log('→ 执行 git add index.html');
  execSync('git add index.html', { cwd: __dirname, stdio: 'inherit' });

  // 暂存其他所有改动
  console.log('→ 暂存所有改动');
  execSync('git add -A', { cwd: __dirname, stdio: 'inherit' });

  console.log('→ 执行 git commit');
  execSync(`git commit -m "chore: bump version to ${version}"`, { cwd: __dirname, stdio: 'inherit' });

  console.log('→ 执行 git push');
  execSync('git push', { cwd: __dirname, stdio: 'inherit' });

  console.log('\n✅ 部署完成！');
} catch (e) {
  console.error('\n❌ git 操作失败：', e.message);
  console.log('请手动执行: git add -A && git commit -m "chore: bump version" && git push');
}
