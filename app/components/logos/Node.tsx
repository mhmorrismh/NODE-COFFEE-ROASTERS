export default function Node({ className }: { className?: string }) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <img 
        src="/NODE logo.png" 
        alt="NODE Coffee Roasters" 
        className="w-12 h-12 object-contain"
      />
      <div className="ml-3 flex flex-col">
        <div 
          className="text-2xl font-bold text-gray-900 dark:text-white tracking-wider -mb-1"
          style={{ fontFamily: '"Copperplate New Black Wide", "Copperplate", "Impact", serif' }}
        >
          NODE
        </div>
        <div 
          className="text-xs text-gray-600 dark:text-gray-400 tracking-widest"
          style={{ fontFamily: '"Copperplate New Black Wide", "Copperplate", "Impact", serif' }}
        >
          COFFEE ROASTERS
        </div>
      </div>
    </div>
  );
} 