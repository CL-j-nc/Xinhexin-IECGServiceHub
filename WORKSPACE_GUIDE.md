# CLJHBA 大宗团体承保系统工作区说明

## 项目概览
- 前端：React 19 + Vite，Tailwind 通过 CDN 引入，Font Awesome 用于图标。
- 目标：面向大宗团体车险客户，提供智能咨询、保单查询（含函数调用与 Mock 库）、语音座席，以及隐藏的主管监督与实时辅导模式。
- 环境：`VITE_GEMINI_API_KEY` 通过 `import.meta.env` 注入，浏览器端需要麦克风权限（`metadata.json` 已声明）。

## 启动与构建
1) 安装依赖：`npm install`  
2) 配置密钥：在 `.env.local` 设置 `VITE_GEMINI_API_KEY=<你的键>`  
3) 开发：`npm run dev`（默认端口 3000，可在 `vite.config.ts` 调整）  
4) 构建/预览：`npm run build` / `npm run preview`

## 主要功能模组
- 客户聊天窗口（`components/ChatWidget.tsx`）  
  - 首页仪表板 + FAQ + 快捷操作；切换到聊天视图后展示消息流。  
  - 风险词过滤（`utils/riskControl.containsRiskContent`，`constants.ts` 中的 `RISK_WORDS`）。  
  - 静态问答快路径（`STATIC_QA`）。  
  - 智能回复：`services/geminiService.sendMessageToGemini` 走 Gemini 对话，带函数调用 `lookup_policy`，落地到 `MOCK_POLICY_DB` 查询。系统指令由 `policyEngine.generateSystemInstruction` 注入 95519 边界与合规规则。

- 语音座席模式（`components/VoiceCallInterface.tsx` + `services/liveService.ts`）  
  - `LiveVoiceClient` 接入 Gemini Live（native audio preview），上行麦克风音频，下行语音播放。  
  - 复用同一套系统指令与保单查询工具；处理中断和队列化播放。

- 主管暗门与实时辅导（`App.tsx` 三击 footer 输入密码 `admin`，进入 `SupervisorDashboard`）  
  - 浏览器原生语音转写（`SpeechRecognition`），将实时文本送入 `services/coachingService.generateCoachingTip`。  
  - Gemini 生成 JSON 结构化辅导建议（信任/风险/策略/信息 + 优先级），前端按优先级高亮。  
  - 初始提示与录音开关在仪表左侧，右侧为“AI NEGOTIATION COACH”卡片流。

## 关键文件速览
- `App.tsx`：主入口，包含公开 Chat 模式与隐藏的 Supervisor 模式切换。
- `components/ChatMessage.tsx`：气泡样式与时间戳渲染。
- `constants.ts`：风险词、静态问答、Mock 保单库。
- `services/policyEngine.ts`：合规 JSON（95519 边界、禁止输出、业务范围）+ 系统指令生成。
- `services/geminiService.ts`：文本聊天逻辑，函数调用查询保单并回传模型。
- `services/liveService.ts`：Gemini Live 音频会话、麦克风采集、音频播放、工具调用。
- `services/coachingService.ts`：主管辅导提示生成，约束同一合规策略。
- `services/audioUtils.ts`：音频编解码与 PCM 处理。
- `index.html`：引入 Tailwind CDN、Font Awesome 与 importmap，入口挂载 `index.tsx`。
- `vite.config.ts`：端口/host，React 插件。

## 注意事项
- 未配置 API Key 时，聊天接口会提示错误；Live/Coaching 也将无法工作。
- 语音相关功能依赖浏览器支持麦克风与 Web Audio，且需要用户授权。
- `MOCK_POLICY_DB` 仅示例用途，实际应替换成后端接口并增加鉴权与审计。
