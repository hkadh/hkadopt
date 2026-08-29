import { useLang } from '../i18n';
import type { DictKey } from '../dict';

/** Bilingual name: current-language name + the other language next to it. */
export function BiName({ name }: { name: { zh: string; en: string } }) {
  const { L, A } = useLang();
  const alt = A(name);
  return (
    <>
      {L(name)}
      {alt && <span className="name-alt"> {alt}</span>}
    </>
  );
}

export function PetAvatar({
  emoji,
  hue,
  size = 'md',
  className = '',
}: {
  emoji: string;
  hue: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const px = size === 'sm' ? 46 : size === 'lg' ? 132 : 72;
  const fs = size === 'sm' ? 24 : size === 'lg' ? 72 : 40;
  return (
    <div
      className={`pet-avatar ${className}`}
      style={{
        width: px,
        height: px,
        fontSize: fs,
        background: `linear-gradient(135deg, hsl(${hue} 75% 88%), hsl(${(hue + 40) % 360} 70% 76%))`,
      }}
      aria-hidden="true"
    >
      <span>{emoji}</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useLang();
  const key = `status.${status}` as DictKey;
  return <span className={`status-badge status-${status}`}>{t(key)}</span>;
}
