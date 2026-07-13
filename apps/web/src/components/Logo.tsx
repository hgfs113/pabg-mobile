export const LOGO_SRC = '/content/assets/logo.png';

interface Props {
  size?: 'header' | 'splash' | 'login';
  className?: string;
  onClick?: () => void;
  title?: string;
}

export default function Logo({ size = 'header', className, onClick, title }: Props) {
  const img = (
    <img
      className={className ?? `app-logo app-logo--${size}`}
      src={LOGO_SRC}
      alt="Path of the Researcher"
      draggable={false}
    />
  );

  if (!onClick) return img;

  return (
    <button
      type="button"
      className="app-logo-btn"
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {img}
    </button>
  );
}
