# fix_dashboards.py — Convert member dashboards 08, 13, 14 to new card style
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('js/apps.js', 'r', encoding='utf-8') as f:
    data = f.read()

# 1. Add R-879-14 routing after R-879-13
old_routing = "    } else if (GameState._currentMember === 'R-879-13') {\n      renderMemberDashboard13();\n    } else if (GameState._currentMember === 'R-879-08') {"
new_routing = "    } else if (GameState._currentMember === 'R-879-13') {\n      renderMemberDashboard13();\n    } else if (GameState._currentMember === 'R-879-14') {\n      renderMemberDashboard14();\n    } else if (GameState._currentMember === 'R-879-08') {"
data = data.replace(old_routing, new_routing)
print("1. Routing added")

# 2. Replace generic renderMemberDashboard() with renderMemberDashboard14()
old_dash14 = "function renderMemberDashboard() {\n  document.getElementById('screenContent').innerHTML = `\n    <div class=\"app-view\">\n      <div class=\"app-header\">\n        <button class=\"back-btn\" onclick=\"navigateToSite('home')\">←</button>\n        <span class=\"app-title\">会员系统</span>\n      </div>\n      <div class=\"webpage-view\">\n        <div class=\"webpage-bar\">\n          <span style=\"color:rgba(0,255,0,0.5);font-size:11px;\">🟢</span>\n          <div class=\"webpage-url\">radio879.com/member — 已登录</div>\n        </div>\n        <div class=\"webpage-body\">\n          <p style=\"color:#34c759;font-size:13px;margin-bottom:16px;\">欢迎，R-879-14。</p>\n          <div style=\"background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;margin-bottom:12px;\">\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px;\">你的档案</div>\n            <div style=\"font-size:13px;color:#fff;margin-bottom:2px;\">R-879-14 — 林小敏</div>\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.5);\">推荐人：R-879-01 ｜ 阶段三（服从）</div>\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.5);\">转化进度：94% ｜ 记忆清除：有效</div>\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.5);\">当前任务：推荐新人（R-879-15）</div>\n          </div>\n          <div style=\"background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;margin-bottom:12px;\">\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px;\">推荐链</div>\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.6);font-family:monospace;line-height:1.8;\">\n              R-879-01（创始）<br>\n              &nbsp;&nbsp;├→ R-879-02 ～ R-879-07<br>\n              &nbsp;&nbsp;├→ <strong>R-879-14（你）</strong><br>\n              &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;└→ <strong style=\"color:#ffcc00;\">R-879-15（预注册）</strong><br>\n              &nbsp;&nbsp;└→ 共 47 人\n            </div>\n          </div>\n          <div style=\"background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;margin-bottom:12px;\">\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:8px;\">关联页面</div>\n            <a href=\"#\" onclick=\"event.preventDefault();navigateToSite('search')\">🔍 资料搜索</a>\n            <a href=\"#\" onclick=\"event.preventDefault();navigateToSite('internal14')\">📋 内部报告</a>\n            <a href=\"#\" onclick=\"event.preventDefault();navigateToSite('fallDiary')\">📓 堕落日记</a>\n            <a href=\"#\" onclick=\"event.preventDefault();navigateToSite('listeners')\">👥 听众墙</a>\n            <a href=\"#\" onclick=\"event.preventDefault();quickLoginForm()\" style=\"color:rgba(255,255,255,0.25);font-size:11px;\">🔄 切换</a> · <a href=\"#\" onclick=\"event.preventDefault();memberLogout()\" style=\"color:rgba(255,59,48,0.6);\">🚪 退出登录</a>\n          </div>\n        </div>\n      </div>\n    </div>\n  `;\n  if (!GameState.foundClues.includes('member_logged_in')) {\n    GameState.foundClues.push('member_logged_in');\n    GameState.save();\n  }\n}"

new_dash14 = """function renderMemberDashboard14() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span style="font-weight:600;">会员中心 — 林小敏</span>
        <span></span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;">
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;margin-bottom:6px;">📋 R-879-14</div>
          <div style="color:rgba(255,255,255,0.7);">姓名：林小敏</div>
          <div style="color:rgba(255,255,255,0.7);">身份：普通上班族</div>
          <div style="margin-top:8px;background:rgba(0,200,100,0.15);border-radius:8px;padding:8px 12px;color:#4cda64;font-size:12px;">阶段：三 · 服从中</div>
        </div>
        <div class="radio-nav" style="flex-direction:column;">
          <a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a>
          <a href="#" onclick="event.preventDefault();renderFallDiary('R-879-14')">📓 堕落日记</a>
          <a href="#" onclick="event.preventDefault();quickLoginForm()" style="color:rgba(255,255,255,0.25);font-size:11px;">🔄 切换</a> · <a href="#" onclick="event.preventDefault();memberLogout()" style="color:rgba(255,59,48,0.6);">🚪 退出登录</a>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_logged_in')) {
    GameState.foundClues.push('member_logged_in');
    GameState.save();
  }
}"""

if old_dash14 in data:
    data = data.replace(old_dash14, new_dash14)
    print("2. Dash 14 replaced")
else:
    print("2. Dash 14 NOT FOUND")

# 3. Replace renderMemberDashboard13() with new style
old_dash13 = "function renderMemberDashboard13() {\n  document.getElementById('screenContent').innerHTML = `\n    <div class=\"app-view\">\n      <div class=\"app-header\">\n        <button class=\"back-btn\" onclick=\"navigateToSite('home')\">←</button>\n        <span class=\"app-title\">会员系统</span>\n      </div>\n      <div class=\"webpage-view\">\n        <div class=\"webpage-bar\">\n          <span style=\"color:rgba(0,255,0,0.5);font-size:11px;\">🟢</span>\n          <div class=\"webpage-url\">radio879.com/member — 已登录</div>\n        </div>\n        <div class=\"webpage-body\">\n          <p style=\"color:#34c759;font-size:13px;margin-bottom:16px;\">欢迎，R-879-13。</p>\n          <div style=\"background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;margin-bottom:12px;\">\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px;\">你的档案</div>\n            <div style=\"font-size:13px;color:#fff;margin-bottom:2px;\">R-879-13 — 江晓琳</div>\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.5);\">推荐人：R-879-01 ｜ 阶段三（接近完成）</div>\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.5);\">转化进度：98% ｜ 记忆清除：有效</div>\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.5);\">关联者：林小敏（R-879-14）</div>\n          </div>\n          <div style=\"background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;margin-bottom:12px;\">\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:8px;\">关联页面</div>\n            <a href=\"#\" onclick=\"event.preventDefault();navigateToSite('search')\">🔍 资料搜索</a>\n            <a href=\"#\" onclick=\"event.preventDefault();navigateToSite('internal13')\">📋 内部报告</a>\n            <a href=\"#\" onclick=\"event.preventDefault();navigateToSite('fallDiary')\">📓 堕落日记</a>\n            <a href=\"#\" onclick=\"event.preventDefault();navigateToSite('listeners')\">👥 听众墙</a>\n            <a href=\"#\" onclick=\"event.preventDefault();quickLoginForm()\" style=\"color:rgba(255,255,255,0.25);font-size:11px;\">🔄 切换</a> · <a href=\"#\" onclick=\"event.preventDefault();memberLogout()\" style=\"color:rgba(255,59,48,0.6);\">🚪 退出登录</a>\n          </div>\n        </div>\n      </div>\n    </div>\n  `;\n  if (!GameState.foundClues.includes('member_logged_in')) {\n    GameState.foundClues.push('member_logged_in');\n    GameState.save();\n  }\n}"

new_dash13 = """function renderMemberDashboard13() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span style="font-weight:600;">会员中心 — 江晓琳</span>
        <span></span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;">
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;margin-bottom:6px;">💉 R-879-13</div>
          <div style="color:rgba(255,255,255,0.7);">姓名：江晓琳</div>
          <div style="color:rgba(255,255,255,0.7);">身份：护士</div>
          <div style="margin-top:8px;background:rgba(0,200,100,0.15);border-radius:8px;padding:8px 12px;color:#4cda64;font-size:12px;">阶段：三 · 接近完成（98%）</div>
        </div>
        <div class="radio-nav" style="flex-direction:column;">
          <a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a>
          <a href="#" onclick="event.preventDefault();renderFallDiary('R-879-13')">📓 堕落日记</a>
          <a href="#" onclick="event.preventDefault();quickLoginForm()" style="color:rgba(255,255,255,0.25);font-size:11px;">🔄 切换</a> · <a href="#" onclick="event.preventDefault();memberLogout()" style="color:rgba(255,59,48,0.6);">🚪 退出登录</a>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_logged_in')) {
    GameState.foundClues.push('member_logged_in');
    GameState.save();
  }
}"""

if old_dash13 in data:
    data = data.replace(old_dash13, new_dash13)
    print("3. Dash 13 replaced")
else:
    print("3. Dash 13 NOT FOUND")

# 4. Replace renderMemberDashboard08() with new style
old_dash08 = "function renderMemberDashboard08() {\n  document.getElementById('screenContent').innerHTML = `\n    <div class=\"app-view\">\n      <div class=\"app-header\">\n        <button class=\"back-btn\" onclick=\"navigateToSite('home')\">←</button>\n        <span class=\"app-title\">会员系统</span>\n      </div>\n      <div class=\"webpage-view\">\n        <div class=\"webpage-bar\">\n          <span style=\"color:rgba(0,255,0,0.5);font-size:11px;\">🟢</span>\n          <div class=\"webpage-url\">radio879.com/member — 已登录</div>\n        </div>\n        <div class=\"webpage-body\">\n          <p style=\"color:#34c759;font-size:13px;margin-bottom:16px;\">欢迎，R-879-08。</p>\n          <div style=\"background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;margin-bottom:12px;\">\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px;\">你的档案</div>\n            <div style=\"font-size:13px;color:#fff;margin-bottom:2px;\">R-879-08 — 苏灵悦</div>\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.5);\">推荐人：R-879-06 ｜ 阶段三（服从）</div>\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.5);\">转化进度：100% ｜ 记忆清除：有效</div>\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.5);\">职业：护士（已离职）</div>\n          </div>\n          <div style=\"background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;margin-bottom:12px;\">\n            <div style=\"font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:8px;\">关联页面</div>\n            <a href=\"#\" onclick=\"event.preventDefault();navigateToSite('search')\">🔍 资料搜索</a>\n            <a href=\"#\" onclick=\"event.preventDefault();navigateToSite('internal08')\">📋 内部报告</a>\n            <a href=\"#\" onclick=\"event.preventDefault();navigateToSite('fallDiary')\">📓 堕落日记</a>\n            <a href=\"#\" onclick=\"event.preventDefault();navigateToSite('listeners')\">👥 听众墙</a>\n            <a href=\"#\" onclick=\"event.preventDefault();quickLoginForm()\" style=\"color:rgba(255,255,255,0.25);font-size:11px;\">🔄 切换</a> · <a href=\"#\" onclick=\"event.preventDefault();memberLogout()\" style=\"color:rgba(255,59,48,0.6);\">🚪 退出登录</a>\n          </div>\n        </div>\n      </div>\n    </div>\n  `;\n  if (!GameState.foundClues.includes('member_logged_in')) {\n    GameState.foundClues.push('member_logged_in');\n    GameState.save();\n  }\n}"

new_dash08 = """function renderMemberDashboard08() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span style="font-weight:600;">会员中心 — 苏灵悦</span>
        <span></span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;">
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;margin-bottom:6px;">👁️ R-879-08</div>
          <div style="color:rgba(255,255,255,0.7);">姓名：苏灵悦</div>
          <div style="color:rgba(255,255,255,0.7);">身份：护士（已离职）</div>
          <div style="margin-top:8px;background:rgba(0,200,100,0.15);border-radius:8px;padding:8px 12px;color:#4cda64;font-size:12px;">阶段：三 · 已完全转化</div>
        </div>
        <div class="radio-nav" style="flex-direction:column;">
          <a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a>
          <a href="#" onclick="event.preventDefault();renderFallDiary('R-879-08')">📓 堕落日记</a>
          <a href="#" onclick="event.preventDefault();quickLoginForm()" style="color:rgba(255,255,255,0.25);font-size:11px;">🔄 切换</a> · <a href="#" onclick="event.preventDefault();memberLogout()" style="color:rgba(255,59,48,0.6);">🚪 退出登录</a>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_logged_in')) {
    GameState.foundClues.push('member_logged_in');
    GameState.save();
  }
}"""

if old_dash08 in data:
    data = data.replace(old_dash08, new_dash08)
    print("4. Dash 08 replaced")
else:
    print("4. Dash 08 NOT FOUND")

with open('js/apps.js', 'w', encoding='utf-8') as f:
    f.write(data)

print("All done!")
