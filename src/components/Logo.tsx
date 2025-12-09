import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="inline-flex items-center">
      <img
        src="https://res.cloudinary.com/darhndmms/image/upload/v1765207904/WhatsApp_Image_2025-10-28_at_11.51.32_0752b31a_-_Copy_ivmyz2.jpg"
        alt="Plugged logo"
        className="h-12 w-auto"
      />
    </Link>
  );
}
