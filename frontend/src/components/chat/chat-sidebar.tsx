"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ChatSession {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    _count: {
        messages: number;
    };
}

interface ChatSidebarProps {
    activeSessionId: string | null;
    onSessionSelect: (sessionId: string) => void;
    onNewChat: () => void;
}

export function ChatSidebar({
    activeSessionId,
    onSessionSelect,
    onNewChat,
}: ChatSidebarProps) {
    const queryClient = useQueryClient();

    // Fetch chat sessions
    const { data: sessions, isLoading } = useQuery<ChatSession[]>({
        queryKey: ["chat-sessions"],
        queryFn: async () => {
            const { data } = await api.get("/chat/sessions");
            return data;
        },
    });

    // Delete session mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/chat/sessions/${id}`);
        },
        onSuccess: () => {
            toast.success("Chat deleted");
            queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to delete chat");
        },
    });

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Delete this chat?")) {
            deleteMutation.mutate(id);
            if (activeSessionId === id) {
                onNewChat();
            }
        }
    };

    return (
        <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <Button
                    onClick={onNewChat}
                    className="w-full"
                    size="sm"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-1">
                    {isLoading ? (
                        <div className="text-sm text-muted-foreground p-4 text-center">
                            Loading...
                        </div>
                    ) : sessions?.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-4 text-center">
                            No chats yet
                        </div>
                    ) : (
                        sessions?.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => onSessionSelect(session.id)}
                                className={cn(
                                    "group flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors",
                                    activeSessionId === session.id
                                        ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                )}
                            >
                                <div className="flex-1 min-w-0 mr-2">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                                        <p className="text-sm font-medium truncate">
                                            {session.title}
                                        </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(session.updatedAt), "MMM d, h:mm a")}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                                    onClick={(e) => handleDelete(e, session.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
