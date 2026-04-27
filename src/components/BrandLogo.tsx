import { Link } from 'react-router-dom';

interface BrandLogoProps {
  compact?: boolean;
}

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <Link to="/" className="inline-flex items-center gap-3">
      <img src="/prelounge-logo.svg" alt="PreLounge logo" className={compact ? 'h-8 w-8' : 'h-10 w-10'} />
      <span className={compact ? 'text-lg font-bold text-black' : 'text-2xl font-bold text-black'}>
        Pre<span className="text-red-600">Lounge</span>
      </span>
    </Link>
  );
}
