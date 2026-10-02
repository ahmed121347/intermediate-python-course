// AI Assistant Intelligence Center View Renderer

window.renderAICenter = async function() {
  const workspace = document.getElementById('workspace-view');

  try {
    const res = await fetch('/api/ai/insights');
    const insights = await res.json();

    workspace.innerHTML = `
      <div class="qyada-card" style="border-color: var(--gold-accent);">
        <div class="card-title">
          <span><i class="fa-solid fa-robot" style="color:var(--gold-accent);"></i> مركز التحليلات والتنبؤات الذكية (QYADA Construction AI Center)</span>
          <span style="font-size:12px; color:var(--color-green); font-weight:700;"><i class="fa-solid fa-brain"></i> مؤشر صحة العمليات: ${insights.ai_health_score}%</span>
        </div>
        <div style="background:var(--bg-panel); padding:15px; border-radius:12px; margin-bottom:20px; border:1px solid rgba(183,139,46,0.3);">
          <p style="color:var(--gold-accent); font-weight:700; margin-bottom:6px;">ملخص التحليل التنبؤي اللحظي:</p>
          <p style="color:var(--text-white); font-size:13px;">${insights.summary_ar}</p>
        </div>

        <!-- Risk Alerts Section -->
        <h4 style="color:var(--gold-accent); margin-bottom:12px;"><i class="fa-solid fa-triangle-exclamation"></i> تنبيهات المخاطر المكتشفة مبكرًا:</h4>
        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:25px;">
          ${insights.risk_alerts.map(r => `
            <div style="background:var(--bg-card); padding:15px; border-radius:12px; border-right:4px solid var(--color-red); border:1px solid var(--border-gold);">
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span style="font-weight:700; color:var(--text-white);">${r.project_name_ar} (${r.project_code})</span>
                <span style="color:var(--color-red); font-weight:700; font-size:12px;">${r.risk_type} | تأخير: ${r.delay_days} يوم</span>
              </div>
              <p style="font-size:12px; color:var(--text-muted);"><i class="fa-solid fa-lightbulb" style="color:var(--gold-accent);"></i> توصية النظام الذكي: ${r.recommendation_ar}</p>
            </div>
          `).join('')}
        </div>

        <!-- AI Assistant Chat Interface -->
        <div class="qyada-card" style="background:var(--bg-panel);">
          <div class="card-title"><i class="fa-solid fa-comments"></i> المحادثة المباشرة مع المساعد التنفيذي للقيادة (QYADA AI Executive Assistant)</div>
          <div id="ai-chat-messages" style="height:220px; overflow-y:auto; background:var(--bg-main); padding:15px; border-radius:10px; border:1px solid var(--border-gold); margin-bottom:15px; display:flex; flex-direction:column; gap:10px;">
            <div style="background:var(--bg-card); padding:10px 14px; border-radius:10px; align-self:flex-start; max-width:80%; border:1px solid rgba(183,139,46,0.3);">
              <span style="color:var(--gold-accent); font-weight:700;">المساعد الذكي:</span> أهلاً بك د. سلطان. أنا المساعد الذكي لمجموعة قيادة. يمكنك استفساري عن المخاطر، التدفقات النقدية، أو اعتمادات المشتريات.
            </div>
          </div>

          <div style="display:flex; gap:10px;">
            <input type="text" id="ai-chat-input" placeholder="اكتب سؤالك هنا (مثال: ما هي التوقعات النقدية للمشاريع؟)..." style="flex:1; padding:12px 16px; border-radius:10px; background:var(--bg-main); border:1px solid var(--border-gold); color:white; outline:none;" onkeypress="if(event.key === 'Enter') sendAIChatMessage()">
            <button class="btn-gold" onclick="sendAIChatMessage()"><i class="fa-solid fa-paper-plane"></i> إرسال</button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("AI Center Error:", err);
  }
};

window.sendAIChatMessage = async function() {
  const input = document.getElementById('ai-chat-input');
  const text = input.value.trim();
  if (!text) return;

  const chatContainer = document.getElementById('ai-chat-messages');

  // Append User Msg
  chatContainer.innerHTML += `
    <div style="background:var(--gold-accent); color:var(--bg-main); padding:10px 14px; border-radius:10px; align-self:flex-end; max-width:80%; font-weight:600;">
      ${text}
    </div>
  `;
  input.value = '';
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: text })
    });
    const data = await res.json();

    // Append AI Response
    chatContainer.innerHTML += `
      <div style="background:var(--bg-card); padding:10px 14px; border-radius:10px; align-self:flex-start; max-width:80%; border:1px solid rgba(183,139,46,0.3);">
        <span style="color:var(--gold-accent); font-weight:700;">المساعد الذكي:</span> ${data.response_ar}
      </div>
    `;
    chatContainer.scrollTop = chatContainer.scrollHeight;
  } catch (e) {
    console.error("AI Chat Response Error:", e);
  }
};
