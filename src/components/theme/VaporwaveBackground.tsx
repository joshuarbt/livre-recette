export function VaporwaveBackground() {
  return (
    <div
      className="vaporwave-background pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden"
      aria-hidden
    >
      <div className="vaporwave-sun" />
      <div className="vaporwave-grid" />
    </div>
  );
}
