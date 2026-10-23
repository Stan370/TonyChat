/**
 * Sandboxed preview frame for generated or example HTML. Without
 * allow-same-origin the content runs in an opaque origin, so it cannot read
 * TonyChat's localStorage, cookies or DOM.
 */
export default function HtmlPreview({ html, src, title, className = "" }: { html?: string; src?: string; title: string; className?: string }) {
  return (
    <iframe
      title={title}
      src={html === undefined ? src : undefined}
      srcDoc={html}
      sandbox="allow-scripts allow-modals allow-pointer-lock"
      className={`h-full w-full border-0 bg-white ${className}`}
    />
  );
}
