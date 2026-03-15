import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Camera, Utensils, Clock } from "lucide-react";
import { Avatar } from "../components/avatar";
import { useStore } from "../components/store";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "深夜了，来份小食吧";
  if (hour < 11) return "早安，享用早餐吧";
  if (hour < 14) return "午间时光，好好吃饭";
  if (hour < 17) return "下午好，来杯茶歇";
  if (hour < 21) return "晚餐时间，放松享用";
  return "夜间小食，温柔以待";
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}秒`;
  return `${m}分${s > 0 ? s + "秒" : ""}`;
}

export function HomePage() {
  const navigate = useNavigate();
  const { todayCount, lastDuration, settings } = useStore();

  return (
    <div className="flex flex-col items-center px-6 pt-10 pb-16 h-full">
      {/* Date & Greeting */}
      <motion.div
        className="w-full mb-8"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-muted-foreground" style={{ fontSize: 13 }}>
          {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" })}
        </p>
        <h1 className="text-foreground mt-0.5">
          {settings.userName ? `${settings.userName}，` : ""}
          {getGreeting()}
        </h1>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="w-full flex gap-3 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex-1 bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Utensils size={14} className="text-primary" />
            <span className="text-muted-foreground" style={{ fontSize: 12 }}>今日</span>
          </div>
          <p className="text-foreground" style={{ fontSize: 22 }}>
            {todayCount}
            <span style={{ fontSize: 12 }} className="text-muted-foreground ml-1">餐</span>
          </p>
        </div>
        <div className="flex-1 bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-[#7EB5C4]" />
            <span className="text-muted-foreground" style={{ fontSize: 12 }}>上次</span>
          </div>
          <p className="text-foreground" style={{ fontSize: lastDuration ? 15 : 13 }}>
            {lastDuration ? formatDuration(lastDuration) : "—"}
          </p>
        </div>
      </motion.div>

      {/* Avatar */}
      <motion.div
        className="my-6 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Avatar config={settings.avatarConfig} size={140} showCard />
      </motion.div>

      {/* Message */}
      <motion.p
        className="text-muted-foreground text-center mt-2 mb-8"
        style={{ fontSize: 13, lineHeight: 1.6 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        准备好了吗？放下手机，专注这一餐
      </motion.p>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Buttons */}
      <motion.div
        className="w-full space-y-3 mb-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <button
          onClick={() => navigate("/session")}
          className="w-full bg-primary text-primary-foreground rounded-2xl py-4 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
        >
          <Utensils size={18} />
          <span>开始用餐</span>
        </button>
        <button
          onClick={() => navigate("/session?photo=true")}
          className="w-full bg-card text-foreground rounded-2xl py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform border border-border"
        >
          <Camera size={16} className="text-muted-foreground" />
          <span className="text-muted-foreground" style={{ fontSize: 14 }}>拍照记录</span>
        </button>
      </motion.div>
    </div>
  );
}
