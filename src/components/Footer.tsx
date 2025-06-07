import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-8 mt-auto">
      <div className="container mx-auto px-6 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          <Link 
            href="https://satsclub.space" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            SatsClub
          </Link>
          {' '}is powered by{' '}
          <Link 
            href="https://commerce.bitvora.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            Bitvora Commerce
          </Link>
        </p>
      </div>
    </footer>
  );
} 