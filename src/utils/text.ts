// Utility functions for text formatting

/**
 * Convert a free-form forecast string into Markdown with sensible paragraphs.
 * - Preserves existing blank lines if present
 * - Otherwise splits on sentence boundaries and groups 2-3 sentences
 * - Targets ~300-400 chars per paragraph to avoid walls of text
 */
export function formatForecastToMarkdown(
    input: string | null | undefined,
    options?: { forceLastSentenceParagraph?: boolean }
): string {
    if (!input) return '';
    // Normalize whitespace/newlines
    let text = String(input)
        .replace(/\r\n/g, '\n')
        .replace(/\t+/g, ' ')
        .replace(/\s+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    const hasManualParagraphs = /\n{2,}/.test(text);
    // If author already provided paragraph breaks and we don't need to force the last sentence rule, return as-is
    if (hasManualParagraphs && !options?.forceLastSentenceParagraph) return text;

    // Split into sentences using punctuation for Latin and CJK
    const sentences = text.split(/(?<=[.!?。！？])\s+(?=[A-Z0-9“"'(])/);

    const paragraphs: string[] = [];
    let current = '';
    for (const raw of sentences) {
        const s = raw.trim();
        if (!s) continue;

        const currentSentenceCount = current ? current.split(/(?<=[.!?。！？])/).filter(Boolean).length : 0;
        const wouldBe = current ? current + ' ' + s : s;

        const withinCharLimit = wouldBe.length <= 420; // soft cap per paragraph
        const withinSentenceLimit = currentSentenceCount < 2; // 2-3 sentences max

        if (current && withinCharLimit && withinSentenceLimit) {
            current = wouldBe;
        } else {
            if (current) paragraphs.push(current);
            current = s;
        }
    }
    if (current) paragraphs.push(current);

    if (options?.forceLastSentenceParagraph && sentences.length > 0) {
        const lastSentence = sentences[sentences.length - 1].trim();
        if (lastSentence) {
            if (paragraphs.length === 0) {
                paragraphs.push(lastSentence);
            } else {
                const lastIdx = paragraphs.length - 1;
                const lastPara = paragraphs[lastIdx];
                if (lastPara.endsWith(lastSentence)) {
                    const remaining = lastPara.slice(0, lastPara.length - lastSentence.length).trim();
                    if (remaining) paragraphs[lastIdx] = remaining; else paragraphs.splice(lastIdx, 1);
                }
                paragraphs.push(lastSentence);
            }
        }
    }

    return paragraphs.join('\n\n');
}


