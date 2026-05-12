import { useState, useEffect } from 'react';
import { 
    subscribeTournamentMessages, 
    subscribePrivateMessages, 
    sendTournamentMessage as sendTMessage,
    sendPrivateMessage as sendPMessage,
    getOrCreateChatRoom
} from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import type { ChatMessage } from '../types';

export const useChat = (type: 'tournament' | 'private', id: string) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        let unsubscribe: () => void;

        if (type === 'tournament') {
            unsubscribe = subscribeTournamentMessages(id, (newMessages) => {
                setMessages(newMessages);
                setLoading(false);
            });
        } else {
            // For private chat, id is the recipient user ID
            // We first need the chat room ID
            getOrCreateChatRoom(user!.uid, id).then(chatId => {
                unsubscribe = subscribePrivateMessages(chatId, (newMessages) => {
                    setMessages(newMessages);
                    setLoading(false);
                });
            });
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [id, type, user]);

    const sendMessage = async (
        text: string, 
        options?: { isAnnouncement?: boolean; replyTo?: { id: string, name: string, text: string } }
    ) => {
        if (!user || !text.trim()) return;

        if (type === 'tournament') {
            await sendTMessage(id, user.uid, user.displayName || 'Anonim', user.photoURL || undefined, text, options);
        } else {
            const chatId = [user.uid, id].sort().join('_');
            await sendPMessage(chatId, user.uid, user.displayName || 'Anonim', user.photoURL || undefined, text, options?.replyTo);
        }
    };

    return { messages, sendMessage, loading };
};
