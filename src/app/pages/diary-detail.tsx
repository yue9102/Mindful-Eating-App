import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Clock, Utensils, AlertCircle, Star, Trash2, Droplets } from "lucide-react";
import { useState } from "react";
import { useStore } from "../components/store";

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}秒`;
  return `${m}分${sec > 0 ? sec + "秒" : ""}`;
}

function formatFullDate(ts: number): string {
  return new Date(ts).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

export function DiaryDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { entries, deleteEntry } = useStore();
  const [showDelete, setShowDelete] = useState(false);

  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <p className="text-muted-foreground">记录不存在</p>
        <button
          onClick={() => navigate("/diary")}
          className="mt-4 bg-primary text-primary-foreground rounded-xl px-6 py-2"
        >
          返回日记
        </button>
      </div>
    );
  }

  const scoreColor =
    entry.focusScore >= 70 ? "#94B8A0" : entry.focusScore >= 40 ? "#D4AA6A" : "#C95D5D";

  const handleDelete = () => {
    deleteEntry(entry.id);
    navigate("/diary");
  };

  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (entry.focusScore / 100) * circ;

  return (
    <div className="flex flex-col px-6 pt-6 pb-6 min-h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/diary")}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-foreground" style={{ fontSize: 15 }}>
            {formatFullDate(entry.startTime)}
          </p>
          <p className="text-muted-foreground" style={{ fontSize: 12 }}>
            {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
          </p>
        </div>
        <button
          onClick={() => setShowDelete(true)}
          className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"
        >
          <Trash2 size={16} className="text-destructive" />
        </button>
      </div>

      {/* Score + Mood */}
      <motion.div
        className="flex items-center justify-center gap-8 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="40" cy="40" r={r} fill="none" stroke="var(--accent)" strokeWidth="5" />
            <motion.circle
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke={scoreColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute text-center">
            <span style={{ fontSize: 20 }} className="text-foreground">{entry.focusScore}</span>
            <p className="text-muted-foreground" style={{ fontSize: 9 }}>专注分</p>
          </div>
        </div>

        <div className="text-center">
          <span style={{ fontSize: 36 }}>{entry.mood}</span>
          <p className="text-muted-foreground mt-1" style={{ fontSize: 12 }}>
            饱腹感 {entry.satiety}/5
          </p>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-2 gap-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-card rounded-2xl p-4 border border-border text-center">
          <Clock size={18} className="mx-auto text-primary mb-1" />
          <p className="text-foreground" style={{ fontSize: 18 }}>{formatDuration(entry.duration)}</p>
          <p className="text-muted-foreground" style={{ fontSize: 11 }}>用餐时长</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border text-center">
          <Utensils size={18} className="mx-auto text-primary mb-1" />
          <p className="text-foreground" style={{ fontSize: 18 }}>{entry.biteCount}口</p>
          <p className="text-muted-foreground" style={{ fontSize: 11 }}>共吃了</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border text-center">
          <Star size={18} className="mx-auto text-[#D4AA6A] mb-1" />
          <p className="text-foreground" style={{ fontSize: 18 }}>{entry.avgBiteInterval}秒</p>
          <p className="text-muted-foreground" style={{ fontSize: 11 }}>平均间隔</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border text-center">
          <Droplets size={18} className="mx-auto text-[#7EB5C4] mb-1" />
          <p className="text-foreground" style={{ fontSize: 18 }}>{entry.waterCount ?? 0}杯</p>
          <p className="text-muted-foreground" style={{ fontSize: 11 }}>喝水</p>
        </div>
      </motion.div>

      {/* Photo */}
      {entry.photo && (
        <motion.div
          className="bg-card rounded-2xl border border-border mb-6 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <img src={entry.photo} alt="meal" className="w-full h-48 object-cover" />
        </motion.div>
      )}

      {/* Note */}
      {entry.note && (
        <motion.div
          className="bg-card rounded-2xl p-4 border border-border mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-muted-foreground mb-1" style={{ fontSize: 12 }}>备注</p>
          <p className="text-foreground" style={{ fontSize: 14 }}>{entry.note}</p>
        </motion.div>
      )}

      {/* Bite timeline */}
      <motion.div
        className="bg-card rounded-2xl p-4 border border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-muted-foreground mb-3" style={{ fontSize: 12 }}>进食节奏</p>
        <div className="flex items-end gap-[2px] h-16">
          {entry.biteTimestamps.length > 1 &&
            entry.biteTimestamps.slice(1).map((ts, i) => {
              const interval = (ts - entry.biteTimestamps[i]) / 1000;
              const maxH = 60;
              const h = Math.min(maxH, (interval / 30) * maxH);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: h,
                    backgroundColor: interval >= 12 ? "#94B8A0" : interval >= 8 ? "#D4AA6A" : "#C95D5D",
                    opacity: 0.7,
                    minWidth: 3,
                    maxWidth: 12,
                  }}
                />
              );
            })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-muted-foreground" style={{ fontSize: 10 }}>开始</span>
          <span className="text-muted-foreground" style={{ fontSize: 10 }}>结束</span>
        </div>
      </motion.div>

      {/* Delete confirm */}
      {showDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-card rounded-3xl p-6 w-full max-w-sm border border-border"
          >
            <p className="text-foreground text-center" style={{ fontSize: 16 }}>确定删除这条记录吗？</p>
            <p className="text-muted-foreground text-center mt-1" style={{ fontSize: 13 }}>删除后无法恢复</p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 bg-secondary text-secondary-foreground rounded-xl py-3"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-destructive text-destructive-foreground rounded-xl py-3"
              >
                删除
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}