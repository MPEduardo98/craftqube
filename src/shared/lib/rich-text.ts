/**
 * Las descripciones de producto se guardan como HTML generado por TipTap
 * (StarterKit). Antes de inyectarlo con dangerouslySetInnerHTML lo pasamos por
 * esta lista blanca: sólo sobreviven las etiquetas que el editor puede producir
 * y, de los atributos, únicamente href/target/rel en enlaces http(s).
 */

const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "s", "u", "code", "pre",
  "blockquote", "ul", "ol", "li", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6", "a",
]);

/** Etiqueta de apertura/cierre, comentario o cualquier otro `<...>`. */
const TAG_RE = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
/** Elementos cuyo contenido tampoco debe sobrevivir (no sólo las etiquetas). */
const RAW_BLOCK_RE = /<(script|style|iframe|object|embed|noscript|template)\b[^>]*>[\s\S]*?<\/\1\s*>|<(script|style|iframe|object|embed|noscript|template)\b[^>]*>[\s\S]*$/gi;
const HREF_RE = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s">]+))/i;

function safeHref(tag: string): string | null {
  const m = HREF_RE.exec(tag);
  const raw = (m?.[1] ?? m?.[2] ?? m?.[3] ?? "").trim();
  if (!raw) return null;
  if (!/^(https?:\/\/|mailto:|\/)/i.test(raw)) return null;
  return raw.replace(/"/g, "&quot;");
}

export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return "";

  return html.replace(RAW_BLOCK_RE, "").replace(TAG_RE, (tag, name?: string) => {
    if (!name) return "";                       // comentario HTML
    const lower = name.toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) return "";

    if (tag.startsWith("</")) return `</${lower}>`;
    if (lower === "a") {
      const href = safeHref(tag);
      return href
        ? `<a href="${href}" target="_blank" rel="noopener noreferrer nofollow">`
        : "<a>";
    }
    // El resto de etiquetas se reescriben sin ningún atributo.
    return `<${lower}>`;
  });
}

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'",
};

/**
 * Versión en texto plano del HTML, para metadatos (meta description, JSON-LD)
 * donde las etiquetas no deben aparecer. `maxLength` recorta por palabra.
 */
export function richTextToPlain(html: string | null | undefined, maxLength?: number): string {
  if (!html) return "";

  const text = html
    .replace(RAW_BLOCK_RE, "")
    .replace(/<\/(p|div|li|h[1-6]|blockquote|pre)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(TAG_RE, "")
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/gi, (e) => ENTITIES[e.toLowerCase()] ?? e)
    .replace(/\s+/g, " ")
    .trim();

  if (!maxLength || text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, "")}…`;
}

/** ¿Queda algo visible tras quitar etiquetas y espacios? */
export function hasRichTextContent(html: string | null | undefined): boolean {
  if (!html) return false;
  return richTextToPlain(html).length > 0;
}
