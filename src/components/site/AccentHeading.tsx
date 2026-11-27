export function AccentHeading({
  text,
  as: Tag = "h2",
  className,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const words = text.trim().split(/\s+/);
  const last = words.slice(-2).join(" ");
  const first = words.slice(0, -2).join(" ");
  return (
    <Tag className={className}>
      {first ? `${first} ` : null}
      <span className="accent-word accent-line">{last}</span>
    </Tag>
  );
}
