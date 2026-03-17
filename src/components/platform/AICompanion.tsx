import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Sparkles, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface QuickAction {
  label: string;
  icon: any;
  action: () => void;
}

interface AICompanionProps {
  context: string;
  quickActions?: QuickAction[];
}

export default function AICompanion({
  context,
  quickActions = [],
}: AICompanionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: `Ready to help with ${context}. What would you like me to do?`,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const mockResponses = [
        `I've analyzed the ${context} context. Here's what I found...`,
        `Based on the current ${context} state, I recommend...`,
        `Let me help you with that. In the ${context} area...`,
      ];

      const randomResponse =
        mockResponses[Math.floor(Math.random() * mockResponses.length)];

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: randomResponse,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleQuickAction = (action: () => void) => {
    action();
  };

  return (
    <>
      {/* Floating toggle button when collapsed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-white/20 to-white/10 border border-white/20 flex items-center justify-center backdrop-blur-xl hover:border-white/40 transition-colors group"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative"
            >
              <Sparkles className="w-6 h-6 text-white" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, linear: true }}
                className="absolute inset-0 rounded-full border border-white/30"
              />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main companion panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-white/[0.03] backdrop-blur-2xl border-l border-white/10 flex flex-col z-40 shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white/70" />
                <span className="text-sm font-medium text-white/90">
                  AI Assistant
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>

            {/* Context indicator */}
            <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="text-xs text-white/50 mb-1">Current Context</div>
              <div className="inline-block px-2 py-1 rounded bg-white/10 border border-white/20 text-xs font-medium text-white/80">
                {context}
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-xs rounded-lg px-4 py-2 text-sm",
                      message.role === "user"
                        ? "bg-white/20 border border-white/30 text-white"
                        : "bg-white/5 border border-white/10 text-white/90"
                    )}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="w-2 h-2 bg-white/50 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0.1,
                        }}
                        className="w-2 h-2 bg-white/50 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                        className="w-2 h-2 bg-white/50 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            {quickActions.length > 0 && (
              <div className="px-4 py-3 border-t border-white/5 bg-white/[0.02] space-y-2 max-h-32 overflow-y-auto">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleQuickAction(action.action)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-colors text-xs text-white/80"
                    >
                      <Icon className="w-3 h-3" />
                      <span className="truncate">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Input area */}
            <div className="px-4 py-4 border-t border-white/5 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
