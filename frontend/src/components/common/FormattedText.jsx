import React from "react";

/**
 * FormattedText component renders multi-line text with full support for:
 * - Line breaks (\n)
 * - Headings (# H1, ## H2, ### H3)
 * - Bullet point lists (- item, * item)
 * - Bold text (**text**)
 * - Italic text (*text* or _text_)
 */
export function renderFormattedContent(text) {
    if (!text) return null;

    const lines = text.split(/\r?\n/);
    const elements = [];
    let inList = false;
    let listItems = [];

    const parseInline = (str) => {
        if (!str) return "";
        // Bold: **text**
        let parsed = str.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        // Italics: *text* or _text_
        parsed = parsed.replace(/\*(.*?)\*/g, "<em>$1</em>");
        parsed = parsed.replace(/_(.*?)_/g, "<em>$1</em>");
        // Code: `code`
        parsed = parsed.replace(/`(.*?)`/g, "<code class='ps-inline-code'>$1</code>");
        return parsed;
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        // Check bullet point (- item or * item or • item)
        const isBullet = /^[*\-•]\s+/.test(trimmed);

        if (isBullet) {
            const bulletText = trimmed.replace(/^[*\-•]\s+/, "");
            inList = true;
            listItems.push(
                <li
                    key={`li-${index}`}
                    dangerouslySetInnerHTML={{ __html: parseInline(bulletText) }}
                />
            );
            return;
        } else if (inList) {
            // End of list block
            elements.push(
                <ul key={`ul-${index}`} className="ps-formatted-list">
                    {listItems}
                </ul>
            );
            inList = false;
            listItems = [];
        }

        // Empty line
        if (!trimmed) {
            elements.push(<div key={`blank-${index}`} className="ps-blank-line" />);
            return;
        }

        // Headings (# H1, ## H2, ### H3)
        if (trimmed.startsWith("# ")) {
            elements.push(
                <h1 key={`h1-${index}`} className="ps-fmt-h1" dangerouslySetInnerHTML={{ __html: parseInline(trimmed.substring(2)) }} />
            );
        } else if (trimmed.startsWith("## ")) {
            elements.push(
                <h2 key={`h2-${index}`} className="ps-fmt-h2" dangerouslySetInnerHTML={{ __html: parseInline(trimmed.substring(3)) }} />
            );
        } else if (trimmed.startsWith("### ")) {
            elements.push(
                <h3 key={`h3-${index}`} className="ps-fmt-h3" dangerouslySetInnerHTML={{ __html: parseInline(trimmed.substring(4)) }} />
            );
        } else {
            elements.push(
                <p
                    key={`p-${index}`}
                    className="ps-fmt-p"
                    dangerouslySetInnerHTML={{ __html: parseInline(line) }}
                />
            );
        }
    });

    if (inList && listItems.length > 0) {
        elements.push(
            <ul key={`ul-end`} className="ps-formatted-list">
                {listItems}
            </ul>
        );
    }

    return <div className="ps-formatted-text-container">{elements}</div>;
}

export default function FormattedText({ text, className = "" }) {
    if (!text) return null;
    return <div className={`ps-formatted-wrapper ${className}`}>{renderFormattedContent(text)}</div>;
}
