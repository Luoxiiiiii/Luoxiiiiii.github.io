# fix_apps_reports.py
with open('c:/Users/Administrator/Desktop/网页游戏/js/apps.js', 'r', encoding='utf-8') as f:
    data = f.read()

# ===== R-879-17: Replace internal17Content and title =====
old_17_content = "const internal17Content = '<div style=\"padding:4px 0;\"><p style=\"font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:16px;font-style:italic;\">\"爪子不是装伽。是天生的。\"</p><div style=\"background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:12px;\"><div style=\"font-size:15px;font-weight:600;margin-bottom:6px;\">\U0001f98a R-879-17</div><div style=\"color:rgba(255,255,255,0.7);font-size:12px;line-height:1.8;\">姓名：胡晓狸<br>身份：coser · 小狐狸<br>推荐人：未记录<br>状态：等待主人的狐狸</div></div><div class=\"radio-nav\" style=\"flex-direction:column;\"><a href=\"#\" onclick=\"event.preventDefault();renderFallDiary(&#39;R-879-17&#39;)\">\U0001f4d3 堕落日记</a></div></div>';"

# Build the report text
lines_17 = []
lines_17.append("=== 受试者评估报告 ===")
lines_17.append("")
lines_17.append("编号：R-879-17")
lines_17.append("姓名：胡晓狸")
lines_17.append("引入人：未记录（推测为线上社区传播）")
lines_17.append("")
lines_17.append("当前状态：阶段二（认同）")
lines_17.append("记忆清除：未执行")
lines_17.append("转化进度：65%")
lines_17.append("")
lines_17.append("行为指标：")
lines_17.append("- 首次接触：漫展后深夜在论坛发现87.9")
lines_17.append("- 早期表现：将频率作为\"角色扮演的延伸\"")
lines_17.append("- 转化特征：通过cosplay身份（狐妖）作为介质完成自我重构")
lines_17.append("- 关键节点：意识到狐狸不是扮演的，而是真实的自己")
lines_17.append("- 身份整合：接受了\"被占有的狐狸\"作为核心自我认知")
lines_17.append("")
lines_17.append("心理评估：")
lines_17.append("受试者具有典型的表现型人格——她的自我认知高度依赖外部反馈和外化形象（cosplay、装扮、表演）。这类人格的特点是：很容易在扮演中迷失自己，但也恰恰因为这种\"可塑性\"，转化通道极为畅通。")
lines_17.append("")
lines_17.append("与众不同的是，受试者的转化不是\"被打碎后重建\"，而是\"被唤醒\"。她原本就觉得自己是狐狸——87.9只是帮她确认了这件事。因此她的转化过程中几乎没有出现常见的认知失调和抗拒阶段。她欣然接受了\"项圈\"，因为她一直在等一个理由戴上它。")
lines_17.append("")
lines_17.append("受试者对归属感的渴望远超常人。她在日常生活中缺乏稳定的身份锚点，而87.9提供的\"编号系统\"恰好填补了这一空白。R-879-17不仅是一个编号——它是她获得合法身份的证明。")
lines_17.append("")
lines_17.append("备注：受试者的coser身份为87.9提供了天然的传播渠道。她在漫展和社交媒体上的存在具有传播价值。")
lines_17.append("")
lines_17.append("预测：转化完整度极高。受试者有成为推荐人的潜力。")
lines_17.append("")
lines_17.append("=== 文件结束 ===")

report_17_text = "\n".join(lines_17)

# Build the JS content string
# We need to escape for JS single-quoted string: \n for newlines, \' for single quotes
html_17_parts = []
html_17_parts.append('<div style="padding:4px 0;white-space:pre-wrap;font-family:monospace;font-size:11px;color:rgba(255,255,255,0.8);line-height:1.9;">')
for line in lines_17:
    escaped = line.replace("'", "\\'")
    html_17_parts.append(escaped + "\\n")
html_17_parts.append('</div>')

new_17_content = "const internal17Content = '" + "".join(html_17_parts) + "';"

# Replace in file
if old_17_content in data:
    data = data.replace(old_17_content, new_17_content)
    # Also update the title
    data = data.replace("renderRadioSite('狐妖/权'", "renderRadioSite('受试者评估报告 — R-879-17'")
    print("R-879-17: OK")
else:
    print("R-879-17: MARKER NOT FOUND!")
    # Debug: show first 200 chars of old content
    idx = data.find("const internal17Content")
    if idx >= 0:
        print("  Found at", idx, "showing surrounding text...")
        print(repr(data[idx:idx+100]))

# ===== R-879-95: Replace inline content =====
# The old content has specific emojis and text
old_95_marker = "renderRadioSite('重启人生', 'radio879.com/internal/95',"
idx_95 = data.find(old_95_marker)
if idx_95 >= 0:
    # Find the end of this renderRadioSite call
    end_marker_95 = "navigateToSite('member')"
    end_idx_95 = data.find(end_marker_95, idx_95)
    if end_idx_95 >= 0:
        end_idx_95 += len(end_marker_95) + 2  # include );

        lines_95 = []
        lines_95.append("=== 受试者评估报告 ===")
        lines_95.append("")
        lines_95.append("编号：R-879-95")
        lines_95.append("姓名：李小一")
        lines_95.append("引入人：出租车女司机（身份不明，推荐后失联）")
        lines_95.append("")
        lines_95.append("当前状态：接触初期（重建后）")
        lines_95.append("转化进度：15%（正在学习打开自己）")
        lines_95.append("")
        lines_95.append("行为指标：")
        lines_95.append("- 首次接触：由出租车女司机在深夜载客时推荐频率")
        lines_95.append("- 初始状态：长期压抑、自我忽视、活在他人期待中")
        lines_95.append("- 早期行为：被动收听，在电台中找到\"被看见\"的感觉")
        lines_95.append("- 关键转折：尝试做出自己的选择（调闹钟、请半天假）")
        lines_95.append("- 当前阶段：开始承认自己的存在和需求")
        lines_95.append("")
        lines_95.append("心理评估：")
        lines_95.append("受试者为典型的\"乖巧型\"人格——从小到大活在父母的期待里，从未进行过真正的自主选择。她在国企做着稳定的工作，过着\"正确\"的生活，但内心早已精疲力竭。")
        lines_95.append("")
        lines_95.append("受试者的转化路径特殊之处在于——她不是在频率中\"被控制\"，而是在频率中\"被允许\"。祂没有命令她服从，而是告诉她\"你可以选\"。这种温和的引导方式恰好符合受试者的心理缺口：她缺的不是管教，是许可。")
        lines_95.append("")
        lines_95.append("值得注意的是，受试者在日记中展现出了清晰的自我觉察能力。她知道自己累，知道自己想要什么，她只是不敢要。频率给了她一个安全的、无后果的空间去练习\"选择\"。")
        lines_95.append("")
        lines_95.append("预测：受试者有望在频率引导下逐步建立自主性。但依赖风险较高——她可能会将\"自由选择\"的能力完全归功于频率，从而在心理上形成对87.9的长期依赖。")
        lines_95.append("")
        lines_95.append("备注：")
        lines_95.append("受试者为重建后的特殊案例。她收听的是恢复广播后的信号，这意味着她的转化轨迹受01直接影响。与早期成员不同，她接触到的87.9已经过重建，但其核心频率的效力并未减弱。\"声音\"已在她的内部形成了某种自持循环。")
        lines_95.append("")
        lines_95.append("=== 文件结束 ===")

        html_95_parts = []
        html_95_parts.append('<div style="padding:4px 0;white-space:pre-wrap;font-family:monospace;font-size:11px;color:rgba(255,255,255,0.8);line-height:1.9;">')
        for line in lines_95:
            escaped = line.replace("'", "\\'")
            html_95_parts.append(escaped + "\\n")
        html_95_parts.append('</div>')

        new_95_content = "".join(html_95_parts)
        new_95_call = "renderRadioSite('受试者评估报告 — R-879-95', 'radio879.com/internal/95', '" + new_95_content + "', \"navigateToSite('member')\");"

        data = data[:idx_95] + new_95_call + data[end_idx_95:]
        print("R-879-95: OK")
    else:
        print("R-879-95: END MARKER NOT FOUND")
else:
    print("R-879-95: MARKER NOT FOUND!")

with open('c:/Users/Administrator/Desktop/网页游戏/js/apps.js', 'w', encoding='utf-8') as f:
    f.write(data)

print("Done")
