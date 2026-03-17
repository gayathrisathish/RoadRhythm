export function TopBar() {
  return (
    <header className="h-12 border-b border-border bg-surface px-4">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#3FB950",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <p className="text-[13px] font-medium text-primary">Urban Traffic Intelligence Engine</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-normal">
          <p className="text-muted">Metro Interstate I-94</p>
          <p className="text-accent">Live prediction</p>
        </div>
      </div>
    </header>
  );
}
