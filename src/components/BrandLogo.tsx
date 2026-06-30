// Bhagini Graphics brand logo.
// NOTE: this is a faithful SVG re-creation of the logo from the company flyer
// (orange circular "b" badge + wordmark). To use the exact official artwork,
// drop the file at /public/logo.svg (or .png) and swap the <svg> below for an
// <img src="/logo.svg" ... /> — this is the only place the logo is defined.

export default function BrandLogo({
  textClass = "text-headline-md",
  iconSize = 32,
  showText = true,
}: {
  textClass?: string;
  iconSize?: number;
  showText?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="bhaginiBadge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F7B733" />
            <stop offset="100%" stopColor="#E0701A" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="23" fill="url(#bhaginiBadge)" />
        {/* small leaf flourish echoing the flyer mark */}
        <path d="M31 10.5c-4.4.7-7.7 3.7-7.7 7.9 4.4-.2 8.2-3.3 8.2-7.4 0-.3-.2-.6-.5-.5z" fill="#ffffff" opacity="0.9" />
        {/* lowercase b */}
        <text
          x="23.5"
          y="35"
          textAnchor="middle"
          fontSize="27"
          fontWeight={800}
          fill="#ffffff"
          fontFamily="var(--font-inter), Inter, system-ui, sans-serif"
        >
          b
        </text>
      </svg>
      {showText && (
        <span className={`font-display-lg leading-none tracking-tight whitespace-nowrap ${textClass}`}>
          <span className="text-white">Bhagini</span>
          <span className="text-secondary-container">&nbsp;Graphics</span>
        </span>
      )}
    </span>
  );
}
