import { motion } from "framer-motion";

const moods = [
  { name: "Chill", emoji: "😌", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  { name: "Date", emoji: "❤️", color: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800" },
  { name: "Study", emoji: "📚", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  { name: "Party", emoji: "🎉", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
];

export default function MoodSelector({ selected, onSelect }: { selected?: string; onSelect: (mood: string) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 my-8">
      {moods.map((mood) => {
        const isSelected = selected === mood.name;
        return (
          <motion.button
            key={mood.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(isSelected ? "" : mood.name)}
            className={`
              px-6 py-3 rounded-full font-medium transition-all duration-300 border shadow-sm flex items-center gap-2
              ${isSelected ? mood.color + " ring-2 ring-offset-2 ring-primary dark:ring-offset-background" : "bg-card text-card-foreground hover:bg-muted border-border"}
            `}
          >
            <span className="text-xl">{mood.emoji}</span>
            {mood.name}
          </motion.button>
        );
      })}
    </div>
  );
}
