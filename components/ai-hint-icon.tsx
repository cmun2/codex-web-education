type AiHintIconProps = { className?: string };

export function AiHintIcon({ className }: AiHintIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2.8c.4 3.2 2 4.8 5.2 5.2-3.2.4-4.8 2-5.2 5.2-.4-3.2-2-4.8-5.2-5.2 3.2-.4 4.8-2 5.2-5.2Z" />
      <path d="M18.4 13.2c.25 2 1.25 3 3.25 3.25-2 .25-3 1.25-3.25 3.25-.25-2-1.25-3-3.25-3.25 2-.25 3-1.25 3.25-3.25ZM5.2 13.6c.2 1.45.9 2.15 2.35 2.35-1.45.2-2.15.9-2.35 2.35-.2-1.45-.9-2.15-2.35-2.35 1.45-.2 2.15-.9 2.35-2.35Z" />
    </svg>
  );
}
