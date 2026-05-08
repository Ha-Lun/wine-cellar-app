interface SystembolagetLinkProps {
  url?: string | null;
  checkedAt?: string | null;
  query?: string;
}

const SEARCH_BASE = "https://www.systembolaget.se/sok/?q=";

export function SystembolagetLink({ url, checkedAt, query }: SystembolagetLinkProps) {
  // Not yet checked — render nothing
  if (!url && !checkedAt) return null;

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium text-[#003D6E] hover:underline"
        title="View on Systembolaget"
      >
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ background: "#FFD500", border: "1px solid #003D6E" }}
          aria-hidden
        />
        Buy on Systembolaget ↗
      </a>
    );
  }

  const fallback = query
    ? `${SEARCH_BASE}${encodeURIComponent(query)}`
    : "https://www.systembolaget.se/";
  return (
    <a
      href={fallback}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
      title="Search on Systembolaget"
    >
      Not at Systembolaget · search ↗
    </a>
  );
}
