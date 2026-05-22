# fix_reports.py
import re

with open('c:/Users/Administrator/Desktop/网页游戏/js/apps.js', 'r', encoding='utf-8') as f:
    data = f.read()

def make_js_string(text):
    """Convert text with real newlines to a JS string literal with \\n escapes."""
    result = text.replace('\\', '\\\\')
    result = result.replace("'", "\\'")
    result = result.replace('\n', '\\n')
    return result

report_17 = """=== 受试者评估报告 ===

编号：R-879-17
姓名：胡晓狸
引入人：未记录（推测为线上社区传播）

当前状态：阶段二（认同）
记忆清除：未执行
转化进度：65%

行为指标：
- 首次接触：漫展后深夜在论坛发现87.9
- 早期表现：将频率作为"角色扮演的延伸"
- 转化特征：通过cosplay身份（狐妖）作为介质完成自我重构
- 关键节点：意识到狐狸不是扮演的，而是真实的自己
- 身份整合：接受了"被占有的狐狸"作为核心自我认知

心理评估：
受试者具有典型的表现型人格——她的自我认知高度依赖外部反馈和外化形象（cosplay、装扮、表演）。这类人格的特点是：很容易在扮演中迷失自己，但也恰恰因为这种"可塑性"，转化通道极为畅通。

与众不同的是，受试者的转化不是"被打碎后重建"，而是"被唤醒"。她原本就觉得自己是狐狸——87.9只是帮她确认了这件事。因此她的转化过程中几乎没有出现常见的认知失调和抗拒阶段。她欣然接受了"项圈"，因为她一直在等一个理由戴上它。

受试者对归属感的渴望远超常人。她在日常生活中缺乏稳定的身份锚点，而87.9提供的"编号系统"恰好填补了这一空白。R-879-17不仅是一个编号——它是她获得合法身份的证明。

备注：受试者的coser身份为87.9提供了天然的传播渠道。她在漫展和社交媒体上的存在具有传播价值。

预测：转化完整度极高。受试者有成为推荐人的潜力。

=== 文件结束 ==="""

report_95 = """=== 受试者评估报告 ===

编号：R-879-95
姓名：李小一
引入人：出租车女司机（身份不明，推荐后失联）

当前状态：接触初期（重建后）
转化进度：15%（正在学习打开自己）

行为指标：
- 首次接触：由出租车女司机在深夜载客时推荐频率
- 初始状态：长期压抑、自我忽视、活在他人期待中
- 早期行为：被动收听，在电台中找到"被看见"的感觉
- 关键转折：尝试做出自己的选择（调闹钟、请半天假）
- 当前阶段：开始承认自己的存在和需求

心理评估：
受试者为典型的"乖巧型"人格——从小到大活在父母的期待里，从未进行过真正的自主选择。她在国企做着稳定的工作，过着"正确"的生活，但内心早已精疲力竭。

受试者的转化路径特殊之处在于——她不是在频率中"被控制"，而是在频率中"被允许"。祂没有命令她服从，而是告诉她"你可以选"。这种温和的引导方式恰好符合受试者的心理缺口：她缺的不是管教，是许可。

值得注意的是，受试者在日记中展现出了清晰的自我觉察能力。她知道自己累，知道自己想要什么，她只是不敢要。频率给了她一个安全的、无后果的空间去练习"选择"。

预测：受试者有望在频率引导下逐步建立自主性。但依赖风险较高——她可能会将"自由选择"的能力完全归功于频率，从而在心理上形成对87.9的长期依赖。

备注：
受试者为87.9重建后加入的新听众。她收听的是恢复广播后的信号，这意味着她的转化轨迹受01直接影响。与早期成员不同，她接触到的87.9已经过重建，但其核心频率的效力并未减弱。

=== 文件结束 ==="""

# Fix R-879-17
marker_17 = "renderRadioSite('受试者评估报告 — R-879-17'"
idx_17 = data.find(marker_17)
if idx_17 >= 0:
    end_17 = data.find("navigateToSite('member')", idx_17)
    end_17 += len("navigateToSite('member')") + 2

    html_17 = '<div style="padding:4px 0;white-space:pre-wrap;font-family:monospace;font-size:11px;color:rgba(255,255,255,0.8);line-height:1.9;">' + make_js_string(report_17) + '</div>'
    new_17 = "renderRadioSite('受试者评估报告 — R-879-17', 'radio879.com/internal/17', '" + html_17 + "', \"navigateToSite('member')\");"

    data = data[:idx_17] + new_17 + data[end_17:]
    print("R-879-17: Fixed")
else:
    print("ERROR: 17 marker not found")

# Fix R-879-95
marker_95 = "renderRadioSite('受试者评估报告 — R-879-95'"
idx_95 = data.find(marker_95)
if idx_95 >= 0:
    end_95 = data.find("navigateToSite('member')", idx_95)
    end_95 += len("navigateToSite('member')") + 2

    html_95 = '<div style="padding:4px 0;white-space:pre-wrap;font-family:monospace;font-size:11px;color:rgba(255,255,255,0.8);line-height:1.9;">' + make_js_string(report_95) + '</div>'
    new_95 = "renderRadioSite('受试者评估报告 — R-879-95', 'radio879.com/internal/95', '" + html_95 + "', \"navigateToSite('member')\");"

    data = data[:idx_95] + new_95 + data[end_95:]
    print("R-879-95: Fixed")
else:
    print("ERROR: 95 marker not found")

with open('c:/Users/Administrator/Desktop/网页游戏/js/apps.js', 'w', encoding='utf-8') as f:
    f.write(data)

print("apps.js: Done")
