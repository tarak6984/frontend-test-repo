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
import { Send, Bot, User, Loader2, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Document {
  id: string;
  title: string;
  type: string;
  status: string;
  fund?: {
    name: string;
    code: string;
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("openai/gpt-3.5-turbo");
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch available models
  const { data: modelsData } = useQuery({
    queryKey: ["chat-models"],
    queryFn: async () => {
      const { data } = await api.get("/chat/models");
      return data;
    },
  });

  // Fetch user's documents
  const { data: documentsData } = useQuery({
    queryKey: ["chat-documents"],
    queryFn: async () => {
      const { data } = await api.get("/chat/documents");
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

      // Prepare document context
      const documentContext = selectedDocuments.map((doc) => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        status: doc.status,
        fundName: doc.fund?.name,
        fundCode: doc.fund?.code,
      }));

      const { data } = await api.post("/chat/completions", {
        model: selectedModel,
        messages: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        max_tokens: 1000,
        documentContext: documentContext.length > 0 ? documentContext : undefined,
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

  const toggleDocument = (doc: Document) => {
    setSelectedDocuments((prev) => {
      const isSelected = prev.some((d) => d.id === doc.id);
      if (isSelected) {
        return prev.filter((d) => d.id !== doc.id);
      } else {
        return [...prev, doc];
      }
    });
  };

  const removeDocument = (docId: string) => {
    setSelectedDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col p-4">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Assistant
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Document Selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Documents ({selectedDocuments.length})
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Select Documents</h4>
                    <p className="text-xs text-muted-foreground">
                      Choose documents to discuss with the AI
                    </p>
                    {documentsData?.documents?.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">
                        No documents available
                      </p>
                    ) : (
                      documentsData?.documents?.map((doc: Document) => (
                        <div
                          key={doc.id}
                          className="flex items-start space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                          onClick={() => toggleDocument(doc)}
                        >
                          <Checkbox
                            checked={selectedDocuments.some((d) => d.id === doc.id)}
                            onCheckedChange={() => toggleDocument(doc)}
                          />
                          <div className="flex-1 text-sm">
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.type} • {doc.status}
                              {doc.fund && ` • ${doc.fund.name}`}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Model Selector */}
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[200px]">
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
          </div>

          {/* Selected Documents Pills */}
          {selectedDocuments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedDocuments.map((doc) => (
                <Badge key={doc.id} variant="secondary" className="gap-1">
                  <FileText className="h-3 w-3" />
                  {doc.title}
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="ml-1 hover:bg-destructive/20 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
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
                    Select documents above and ask me anything about compliance,
                    audits, or your documents.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 max-w-2xl">
                  <Button
                    variant="outline"
                    className="text-left justify-start"
                    onClick={() => {
                      setInput("Summarize the selected documents");
                    }}
                  >
                    Summarize selected documents
                  </Button>
                  <Button
                    variant="outline"
                    className="text-left justify-start"
                    onClick={() => {
                      setInput("What is the compliance status?");
                    }}
                  >
                    Check compliance status
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
                      setInput("What documents need review?");
                    }}
                  >
                    Documents needing review
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
              placeholder={
                selectedDocuments.length > 0
                  ? "Ask about the selected documents..."
                  : "Type your message..."
              }
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
            {selectedDocuments.length > 0 && (
              <span className="text-blue-600 dark:text-blue-400">
                {selectedDocuments.length} document(s) selected •{" "}
              </span>
            )}
            {modelsData?.models?.length
              ? `Using ${selectedModel.split("/")[1] || selectedModel}`
              : "Configure OPENROUTER_API_KEY to enable chat"}
          </p>
        </div>
      </Card>
    </div>
  );
}
