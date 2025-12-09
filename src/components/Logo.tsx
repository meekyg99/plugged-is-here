import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="inline-flex items-center">
      <span className="text-xl font-bold tracking-widest uppercase">Plugged</span>
    </Link>
  );
}
