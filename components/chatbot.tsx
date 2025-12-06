"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to fetch response");
            }

            const data = await response.json();
            setMessages((prev) => [...prev, data]);
        } catch (error: any) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `Error: ${error.message || "Something went wrong. Please try again."}` },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-20 right-6 z-50 w-[350px] sm:w-[400px] h-[500px] bg-background border rounded-xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b bg-primary text-primary-foreground flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-background/20 rounded-lg">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">SmartSchedule Assistant</h3>
                                    <p className="text-xs opacity-90">Powered by Gemini Fast</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center text-muted-foreground text-sm py-8 px-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Sparkles className="w-6 h-6 text-primary" />
                                        </div>
                                        <p>Hello! I can help you with SmartSchedule in English or Arabic (Saudi dialect).</p>
                                        <p className="mt-2 text-xs">Ask me about scheduling, courses, or how to use the platform.</p>
                                    </div>
                                )}
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex w-full",
                                            msg.role === "user" ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                                msg.role === "user"
                                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                                    : "bg-muted text-foreground rounded-bl-none"
                                            )}
                                        >
                                            {msg.role === "assistant" ? (
                                                <div className="prose prose-sm dark:prose-invert max-w-none text-base leading-relaxed">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <span className="text-base leading-relaxed">{msg.content}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-2.5 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Thinking...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="flex-1"
                                    disabled={isLoading}
                                />
                                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-colors",
                    isOpen ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
            </motion.button>
        </>
    );
}
