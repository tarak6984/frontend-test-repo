"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("openai/gpt-3.5-turbo");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch available models
  const { data: modelsData } = useQuery({
    queryKey: ["chat-models"],
    queryFn: async () => {
      const { data } = await api.get("/chat/models");
      return data;
    },
  });

  // Chat completion mutation
  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const newMessages: Message[] = [
        ...messages,
        { role: "user", content: userMessage },
      ];

      const { data } = await api.post("/chat/completions", {
        model: selectedModel,
        messages: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        max_tokens: 1000,
      });

      return data;
    },
    onSuccess: (data) => {
      const assistantMessage = data.choices[0]?.message?.content;
      if (assistantMessage) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: assistantMessage },
        ]);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to get response. Please check your OpenRouter API key.";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    chatMutation.mutate(userMessage);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col p-4">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Assistant
            </CardTitle>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {modelsData?.models?.map((model: string) => (
                  <SelectItem key={model} value={model}>
                    {model.split("/")[1] || model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">
                    Welcome to Audit Vault AI Assistant
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ask me anything about your documents, compliance, or audit
                    processes.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 max-w-2xl">
                  <Button
                    variant="outline"
                    className="text-left justify-start"
                    onClick={() => {
                      setInput("Summarize the compliance requirements");
                    }}
                  >
                    Summarize compliance requirements
                  </Button>
                  <Button
                    variant="outline"
                    className="text-left justify-start"
                    onClick={() => {
                      setInput("What documents are pending review?");
                    }}
                  >
                    Check pending documents
                  </Button>
                  <Button
                    variant="outline"
                    className="text-left justify-start"
                    onClick={() => {
                      setInput("Explain the audit process");
                    }}
                  >
                    Explain audit process
                  </Button>
                  <Button
                    variant="outline"
                    className="text-left justify-start"
                    onClick={() => {
                      setInput("Help me with document classification");
                    }}
                  >
                    Document classification help
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800"
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={chatMutation.isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!input.trim() || chatMutation.isPending}
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            {modelsData?.models?.length
              ? `Using ${selectedModel.split("/")[1] || selectedModel}`
              : "Configure OPENROUTER_API_KEY to enable chat"}
          </p>
        </div>
      </Card>
    </div>
  );
}
