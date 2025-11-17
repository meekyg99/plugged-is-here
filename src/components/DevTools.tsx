import { useState } from 'react';
import { Database } from 'lucide-react';
import { seedDatabase } from '../scripts/seedData';

export default function DevTools() {
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeed = async () => {
    setSeeding(true);
    setMessage('Seeding database...');
    const result = await seedDatabase();
    if (result.success) {
      setMessage('Database seeded successfully!');
    } else {
      setMessage('Error seeding database. Check console.');
    }
    setSeeding(false);
    setTimeout(() => setMessage(''), 3000);
  };

  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleSeed}
        disabled={seeding}
        className="flex items-center space-x-2 px-4 py-2 bg-black text-white text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        <Database className="w-4 h-4" />
        <span>{seeding ? 'Seeding...' : 'Seed DB'}</span>
      </button>
      {message && (
        <div className="mt-2 px-4 py-2 bg-white border border-black text-sm text-center">
          {message}
        </div>
      )}
    </div>
  );
}
