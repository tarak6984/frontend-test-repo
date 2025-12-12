"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { ChatSidebar } from "@/components/chat/chat-sidebar";

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
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

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

  // Load session messages when session is selected
  useEffect(() => {
    if (activeSessionId) {
      loadSessionMessages(activeSessionId);
    }
  }, [activeSessionId]);

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const { data } = await api.get(`/chat/sessions/${sessionId}`);
      const sessionMessages = data.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));
      setMessages(sessionMessages);
    } catch (error: any) {
      toast.error("Failed to load chat history");
      console.error(error);
    }
  };

  // Load pre-selected documents from sessionStorage
  useEffect(() => {
    const preSelectedDocs = sessionStorage.getItem("chatSelectedDocuments");
    if (preSelectedDocs) {
      try {
        const docs = JSON.parse(preSelectedDocs);
        setSelectedDocuments(docs);
        sessionStorage.removeItem("chatSelectedDocuments");
      } catch (e) {
        console.error("Failed to parse pre-selected documents", e);
      }
    }
  }, []);

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
        sessionId: activeSessionId,
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

      // Update session ID if new session was created
      if (data.sessionId && !activeSessionId) {
        setActiveSessionId(data.sessionId);
        queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to get response");
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

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setSelectedDocuments([]);
  };

  const handleSessionSelect = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const toggleDocument = (doc: Document) => {
    setSelectedDocuments((prev) => {
      const exists = prev.find((d) => d.id === doc.id);
      if (exists) {
        return prev.filter((d) => d.id !== doc.id);
      } else {
        return [...prev, doc];
      }
    });
  };

  const removeDocument = (docId: string) => {
    setSelectedDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <ChatSidebar
        activeSessionId={activeSessionId}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI Assistant</h1>
              <p className="text-sm text-muted-foreground">
                Select documents above and ask me anything about compliance, audits, or your documents.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Document Selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Documents ({selectedDocuments.length})
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96" align="end">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Select Documents</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Choose documents to provide context for the AI
                      </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {documentsData?.documents?.map((doc: Document) => (
                        <div
                          key={doc.id}
                          className="flex items-start space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Checkbox
                            id={doc.id}
                            checked={selectedDocuments.some((d) => d.id === doc.id)}
                            onCheckedChange={() => toggleDocument(doc)}
                          />
                          <label
                            htmlFor={doc.id}
                            className="flex-1 text-sm cursor-pointer"
                          >
                            <div className="font-medium">{doc.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {doc.type} • {doc.status}
                              {doc.fund && ` • ${doc.fund.name}`}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
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
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedDocuments.map((doc) => (
                <Badge
                  key={doc.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  {doc.title}
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-950">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-base font-medium mb-1">
                Welcome to Audit Vault AI Assistant
              </h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Select documents above and ask me anything about compliance, audits, or your documents.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
                <Card 
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    const prompt = selectedDocuments.length > 0 
                      ? "Summarize the selected documents and highlight key compliance requirements" 
                      : "Summarize the compliance requirements for the current period";
                    setInput(prompt);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">
                      Summarize selected documents
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card 
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    const prompt = selectedDocuments.length > 0
                      ? "Check the compliance status of the selected documents"
                      : "What is the overall compliance status of recent documents?";
                    setInput(prompt);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">
                      Check compliance status
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card 
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setInput("Explain the audit process for annual reports");
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">
                      Explain audit process
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card 
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setInput("Which documents are currently pending review or need attention?");
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">
                      Documents needing review
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === "assistant" ? "justify-start" : "justify-end"
                    }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${message.role === "assistant"
                        ? "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                        : "bg-blue-600 text-white"
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
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
            Using {selectedModel.split("/")[1] || selectedModel}
            {selectedDocuments.length > 0 &&
              ` with ${selectedDocuments.length} document${selectedDocuments.length > 1 ? "s" : ""
              }`}
          </p>
        </div>
      </div>
    </div>
  );
}
