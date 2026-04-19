(function () {
    function convertMarkdownToHTML(markdown) {
        let html = markdown || '';

        html = html.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');

        html = html.replace(/^#### (.+)$/gm, '<h4 style="color: #2e7d32; margin-top: 1.5rem; margin-bottom: 0.5rem; font-size: 1.1rem;">$1</h4>');
        html = html.replace(/^### (.+)$/gm, '<h3 style="color: #2e7d32; margin-top: 1.5rem; margin-bottom: 0.5rem; font-size: 1.2rem;">$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2 style="color: #2e7d32; margin-top: 2rem; margin-bottom: 1rem; font-size: 1.4rem; border-bottom: 2px solid #4caf50; padding-bottom: 0.5rem;">$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1 style="color: #2e7d32; margin-top: 2rem; margin-bottom: 1rem; font-size: 1.6rem;">$1</h1>');

        html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #2e7d32; font-weight: 600;">$1</strong>');

        html = html.replace(/^---$/gm, '<hr style="border: none; border-top: 2px solid #e0e0e0; margin: 1.5rem 0;">');

        const lines = html.split('\n');
        let inList = false;
        const result = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const listMatch = line.match(/^(\s*)\* (.+)$/);

            if (listMatch) {
                if (!inList) {
                    result.push('<ul style="margin: 0.5rem 0; padding-left: 2rem; line-height: 1.8;">');
                    inList = true;
                }
                result.push(`<li style="margin: 0.3rem 0;">${listMatch[2]}</li>`);
            } else {
                if (inList) {
                    result.push('</ul>');
                    inList = false;
                }
                result.push(line);
            }
        }
        if (inList) result.push('</ul>');

        html = result.join('\n');

        html = html.replace(/\n\n+/g, '</p><p style="margin: 0.8rem 0; line-height: 1.8;">');
        html = '<p style="margin: 0.8rem 0; line-height: 1.8;">' + html + '</p>';
        html = html.replace(/<p[^>]*>\s*<\/p>/g, '');

        return html;
    }

    function looksLikeRawMarkdown(text) {
        if (!text) return false;
        if (/<(h[1-6]|p|div|ul|ol|strong|em|table)\b/i.test(text)) return false;
        return /(^|\n)#{1,4}\s|\*\*[^*]+\*\*|(^|\n)\s*\*\s/.test(text);
    }

    function renderParentNoteBlock(parentNote) {
        if (!parentNote) return '';
        const escaped = String(parentNote)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        return `<div class="saved-parent-note" style="background:#fff8e1;border:2px solid #ffb300;padding:16px 18px;margin-top:24px;border-radius:8px;"><div style="color:#f57c00;font-weight:bold;font-size:1.05rem;margin-bottom:10px;">📮 保護者向け連絡帳</div><div style="white-space:pre-wrap;line-height:1.8;color:#333;">${escaped}</div></div>`;
    }

    function renderDailyReportForView(report) {
        if (!report) return '';
        let html = report.html || '';
        const reportData = report.report_data || report.data || {};

        if (looksLikeRawMarkdown(html)) {
            html = `<div class="record-rendered" style="line-height:1.8;color:#333;">${convertMarkdownToHTML(html)}</div>`;
        }

        if (reportData.parentNote && !/saved-parent-note/.test(html)) {
            html += renderParentNoteBlock(reportData.parentNote);
        }

        return html;
    }

    window.convertMarkdownToHTML = convertMarkdownToHTML;
    window.renderDailyReportForView = renderDailyReportForView;
    window.renderParentNoteBlock = renderParentNoteBlock;
    window.looksLikeRawMarkdown = looksLikeRawMarkdown;
})();
