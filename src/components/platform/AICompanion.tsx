import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, User as UserIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  icon: any;
  action: () => void;
}

interface AICompanionProps {
  context: string;
  quickActions?: QuickAction[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AICompanion({ context, quickActions = [] }: AICompanionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Ciao! Sono il tuo assistente AI. Come posso aiutarti?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const reply: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "Sto analizzando la tua richiesta. Questa funzione sara' collegata al backend AI presto." };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Toggle button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-shadow"
          >
            <Sparkles className="w-5 h-5 text-white" />
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500"
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "blur(10px)" }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[70vh] max-h-[600px] rounded-2xl border border-white/[0.08] bg-[#0c0c18]/95 backdrop-blur-2xl flex flex-col shadow-2xl shadow-black/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">AI Assistant</div>
                  <div className="text-[9px] text-white/30">{context}</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition-colors">
                <X className="w-3.5 h-3.5 text-white/50" />
              </button>
            </div>

            {/* Quick actions */}
            {quickActions.length > 0 && (
              <div className="px-3 py-2 border-b border-white/[0.04] flex gap-1.5 overflow-x-auto">
                {quickActions.map((qa, i) => (
                  <button key={i} onClick={qa.action} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-medium text-white/60 hover:text-white/90 transition-all whitespace-nowrap">
                    <qa.icon className="w-3 h-3" />
                    {qa.label}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-auto px-3 py-3 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3 h-3 text-violet-400" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed",
                    msg.role === "user" ? "bg-blue-500/20 text-white/90 rounded-br-sm" : "bg-white/[0.05] text-white/70 rounded-bl-sm"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 text-violet-400" />
                  </div>
                  <div className="bg-white/[0.05] px-3 py-2 rounded-xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-white/40" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-white/40" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-white/[0.06]">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Scrivi un messaggio..."
                  className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 outline-none focus:border-violet-500/40 transition-colors"
                />
                <button onClick={sendMessage} className="w-9 h-9 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 flex items-center justify-center transition-colors">
                  <Send className="w-3.5 h-3.5 text-violet-400" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
