import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const categories = [
  { id: 1, name: "Graphics & Design", emoji: "🎨" },
  { id: 2, name: "Digital Marketing", emoji: "📱" },
  { id: 3, name: "Writing & Translation", emoji: "✍️" },
  { id: 4, name: "Video & Animation", emoji: "🎬" },
  { id: 5, name: "Programming & Tech", emoji: "💻" },
  { id: 6, name: "Music & Audio", emoji: "🎵" },
  { id: 7, name: "Business", emoji: "💼" },
  { id: 8, name: "AI Services", emoji: "🤖" },
];

export default function CategoryNav() {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-[64px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide py-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/browse?category=${category.id}`}
              className="group flex items-center gap-2 whitespace-nowrap text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors flex-shrink-0"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">{category.emoji}</span>
              <span>{category.name}</span>
            </Link>
          ))}
          
          {/* More dropdown placeholder */}
          <button className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors flex-shrink-0">
            More
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
