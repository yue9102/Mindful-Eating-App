import { BookOpen, Clock, Star, ChevronRight, Droplets, Camera } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../components/store";

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}秒`;
  return `${m}分${sec > 0 ? sec + "秒" : ""}`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "今天";
  if (d.toDateString() === yesterday.toDateString()) return "昨天";
  return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function getScoreColor(score: number): string {
  if (score >= 70) return "text-[#94B8A0]";
  if (score >= 40) return "text-[#D4AA6A]";
  return "text-[#C95D5D]";
}

function getScoreBg(score: number): string {
  if (score >= 70) return "bg-[#94B8A0]/10";
  if (score >= 40) return "bg-[#D4AA6A]/10";
  return "bg-[#C95D5D]/10";
}

export function DiaryPage() {
  const navigate = useNavigate();
  const { entries } = useStore();

  // Group entries by date
  const grouped = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const dateKey = new Date(entry.startTime).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {});

  const dateKeys = Object.keys(grouped);

  return (
    <div className="flex flex-col px-6 pt-8 pb-6 h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-foreground">用餐日记</h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: 13 }}>
          {entries.length > 0
            ? `共 ${entries.length} 条记录`
            : "还没有记录哦，开始第一餐吧"}
        </p>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center" style={{ fontSize: 14 }}>
            每一餐都值得被记住
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-primary text-primary-foreground rounded-xl px-6 py-2"
          >
            开始第一餐
          </button>
        </motion.div>
      )}

      {/* Entries list */}
      <div className="space-y-6">
        {dateKeys.map((dateKey) => (
          <div key={dateKey}>
            <p className="text-muted-foreground mb-2" style={{ fontSize: 12 }}>
              {formatDate(grouped[dateKey][0].startTime)}
            </p>
            <div className="space-y-2">
              <AnimatePresence>
                {grouped[dateKey].map((entry, idx) => (
                  <motion.button
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigate(`/diary/${entry.id}`)}
                    className="w-full bg-card rounded-2xl p-4 border border-border flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
                  >
                    {/* Mood */}
                    <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center shrink-0" style={{ fontSize: 22 }}>
                      {entry.mood}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-foreground" style={{ fontSize: 14 }}>
                          {formatTime(entry.startTime)}
                        </p>
                        <div className={`px-2 py-0.5 rounded-full ${getScoreBg(entry.focusScore)}`}>
                          <span className={`${getScoreColor(entry.focusScore)}`} style={{ fontSize: 11 }}>
                            {entry.focusScore}分
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-muted-foreground flex items-center gap-1" style={{ fontSize: 12 }}>
                          <Clock size={11} /> {formatDuration(entry.duration)}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1" style={{ fontSize: 12 }}>
                          <Star size={11} /> {entry.biteCount}口
                        </span>
                        {(entry.waterCount ?? 0) > 0 && (
                          <span className="text-[#7EB5C4] flex items-center gap-1" style={{ fontSize: 12 }}>
                            <Droplets size={11} /> {entry.waterCount}
                          </span>
                        )}
                        {entry.photo && (
                          <span className="text-muted-foreground flex items-center gap-0.5" style={{ fontSize: 12 }}>
                            <Camera size={11} />
                          </span>
                        )}
                      </div>
                      {entry.note && (
                        <p className="text-muted-foreground truncate mt-0.5" style={{ fontSize: 12 }}>
                          {entry.note}
                        </p>
                      )}
                    </div>

                    <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}