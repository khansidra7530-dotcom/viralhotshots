/** CLS-safe ad container — replace data-ad-slot with your AdSense unit IDs */
export function AdSlot({
  slot,
  format = "auto",
  className = "",
}: {
  slot: string;
  format?: "auto" | "rectangle" | "vertical";
  className?: string;
}) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (!clientId) {
    return (
      <div
        className={`flex min-h-[90px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-xs text-muted-foreground ${className}`}
        style={{ minHeight: format === "vertical" ? 600 : 90 }}
      >
        Ad slot: {slot}
      </div>
    );
  }

  return (
    <div className={`ad-container overflow-hidden ${className}`} style={{ minHeight: 90 }}>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
