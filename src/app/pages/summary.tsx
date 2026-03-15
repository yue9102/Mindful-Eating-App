import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Clock, Utensils, AlertCircle, Star, Save, X, Droplets } from "lucide-react";
import { Avatar } from "../components/avatar";
import { useStore, DiaryEntry } from "../components/store";

interface SummaryData {
  duration: number;
  biteCount: number;
  avgInterval: number;
  interruptions: number;
  focusScore: number;
  startTime: number;
  biteTimestamps: number[];
  photo?: string;
  waterCount?: number;
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}秒`;
  return `${m}分${sec > 0 ? sec + "秒" : ""}`;
}

const MOODS = ["😊", "😌", "😐", "😔", "😫"];
const MOOD_LABELS = ["开心", "平静", "一般", "低落", "疲惫"];

function ScoreRing({ score }: { score: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? "#94B8A0" : score >= 40 ? "#D4AA6A" : "#C95D5D";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--accent)" strokeWidth="4" />
        <motion.circle
          cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <motion.span
          style={{ fontSize: 22 }} className="text-foreground"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >{score}</motion.span>
        <p className="text-muted-foreground" style={{ fontSize: 10 }}>专注分</p>
      </div>
    </div>
  );
}

export function SummaryPage() {
  const navigate = useNavigate();
  const { addEntry, settings } = useStore();
  const [data, setData] = useState<SummaryData | null>(null);
  const [satiety, setSatiety] = useState(3);
  const [mood, setMood] = useState("😊");
  const [note, setNote] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("sloweat_summary");
    if (raw) {
      setData(JSON.parse(raw));
    } else {
      navigate("/");
    }
  }, [navigate]);

  if (!data) return null;

  const handleSave = () => {
    const entry: DiaryEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      startTime: data.startTime,
      endTime: data.startTime + data.duration * 1000,
      duration: data.duration,
      biteCount: data.biteCount,
      biteTimestamps: data.biteTimestamps,
      interruptions: data.interruptions,
      avgBiteInterval: data.avgInterval,
      focusScore: data.focusScore,
      satiety,
      mood,
      note,
      photo: data.photo,
      waterCount: data.waterCount,
    };
    addEntry(entry);
    sessionStorage.removeItem("sloweat_summary");
    navigate("/");
  };

  const handleDiscard = () => {
    sessionStorage.removeItem("sloweat_summary");
    navigate("/");
  };

  const scoreMessage =
    data.focusScore >= 80 ? "很棒的一餐，非常专注" :
    data.focusScore >= 60 ? "不错，保持这个节奏" :
    data.focusScore >= 40 ? "还行，下次试试更慢一点" :
    "没关系，慢慢来就好";

  return (
    <div className="flex flex-col items-center px-6 pt-8 pb-6 h-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
        <h2 className="text-foreground">用餐结束</h2>
        <p className="text-muted-foreground mt-1" style={{ fontSize: 13 }}>{scoreMessage}</p>
      </motion.div>

      {/* Avatar + Score */}
      <motion.div
        className="flex items-center gap-6 mb-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
      >
        <Avatar config={settings.avatarConfig} size={80} specialAction="happy" />
        <ScoreRing score={data.focusScore} />
      </motion.div>

      {/* Stats */}
      <motion.div
        className="w-full grid grid-cols-2 gap-2.5 mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {[
          { icon: Clock, color: "text-primary", value: formatDuration(data.duration), label: "用餐时长" },
          { icon: Utensils, color: "text-primary", value: `${data.biteCount}口`, label: "共吃了" },
          { icon: Star, color: "text-[#D4AA6A]", value: `${data.avgInterval}s`, label: "平均间隔" },
          { icon: Droplets, color: "text-[#7EB5C4]", value: `${data.waterCount ?? 0}杯`, label: "喝水" },
        ].map((item, i) => (
          <div key={i} className="bg-card rounded-xl p-3.5 border border-border text-center">
            <item.icon size={16} className={`mx-auto ${item.color} mb-1`} />
            <p className="text-foreground" style={{ fontSize: 17 }}>{item.value}</p>
            <p className="text-muted-foreground" style={{ fontSize: 11 }}>{item.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Photo preview */}
      {data.photo && (
        <motion.div
          className="w-full mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <p className="text-foreground mb-2" style={{ fontSize: 13 }}>餐食照片</p>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <img
              src={data.photo}
              alt="meal"
              className="w-full h-40 object-cover"
            />
          </div>
        </motion.div>
      )}

      {/* Satiety */}
      <motion.div className="w-full mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <p className="text-foreground mb-2" style={{ fontSize: 13 }}>饱腹感</p>
        <div className="flex gap-2">
          {["很饿", "微饿", "刚好", "有点撑", "很饱"].map((label, i) => (
            <button
              key={i}
              onClick={() => setSatiety(i + 1)}
              className={`flex-1 py-2 rounded-lg border transition-all ${
                satiety === i + 1
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border"
              }`}
              style={{ fontSize: 12 }}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Mood */}
      <motion.div className="w-full mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <p className="text-foreground mb-2" style={{ fontSize: 13 }}>心情</p>
        <div className="flex gap-2.5 justify-center">
          {MOODS.map((m, i) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                mood === m ? "bg-primary/10 ring-2 ring-primary" : "bg-card border border-border"
              }`}
              style={{ fontSize: 20 }}
            >
              {m}
            </button>
          ))}
        </div>
        <p className="text-center text-muted-foreground mt-1" style={{ fontSize: 11 }}>
          {MOOD_LABELS[MOODS.indexOf(mood)]}
        </p>
      </motion.div>

      {/* Note */}
      <motion.div className="w-full mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <p className="text-foreground mb-2" style={{ fontSize: 13 }}>备注</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="今天吃了什么…"
          className="w-full bg-card border border-border rounded-xl p-3 resize-none text-foreground placeholder:text-muted-foreground/40"
          rows={2}
          style={{ fontSize: 14 }}
        />
      </motion.div>

      {/* Actions */}
      <div className="w-full flex gap-3">
        <button
          onClick={handleDiscard}
          className="flex-1 bg-card text-muted-foreground rounded-xl py-3 flex items-center justify-center gap-1 border border-border active:scale-[0.98] transition-transform"
        >
          <X size={15} />
          <span style={{ fontSize: 14 }}>放弃</span>
        </button>
        <button
          onClick={handleSave}
          className="flex-[2] bg-primary text-primary-foreground rounded-xl py-3 flex items-center justify-center gap-1 active:scale-[0.98] transition-transform"
        >
          <Save size={15} />
          <span style={{ fontSize: 14 }}>保存到日记</span>
        </button>
      </div>
    </div>
  );
}