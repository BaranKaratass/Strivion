import { 
    collection, 
    doc, 
    addDoc, 
    setDoc,
    getDoc,
    getDocs,
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    limit, 
    Timestamp,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { ChatMessage, ChatRoom } from '../types';

// ─── Tournament Chat ──────────────────────────────────────

export const sendTournamentMessage = async (
    tournamentId: string, 
    senderId: string, 
    senderName: string, 
    senderAvatar: string | undefined, 
    text: string,
    options?: {
        isAnnouncement?: boolean;
        replyTo?: { id: string, name: string, text: string }
    }
) => {
    const messagesRef = collection(db, 'tournaments', tournamentId, 'messages');
    await addDoc(messagesRef, {
        senderId,
        senderName,
        senderAvatar: senderAvatar || '',
        text,
        timestamp: Date.now(),
        type: 'text',
        isAnnouncement: options?.isAnnouncement || false,
        replyToId: options?.replyTo?.id || null,
        replyToName: options?.replyTo?.name || null,
        replyToText: options?.replyTo?.text || null
    });
};

export const subscribeTournamentMessages = (
    tournamentId: string, 
    callback: (messages: ChatMessage[]) => void
) => {
    const q = query(
        collection(db, 'tournaments', tournamentId, 'messages'),
        orderBy('timestamp', 'asc'),
        limit(100)
    );

    return onSnapshot(q, (snap) => {
        const messages = snap.docs.map(d => ({
            id: d.id,
            ...d.data()
        } as ChatMessage));
        callback(messages);
    });
};

// ─── Private DMs ──────────────────────────────────────────

export const getOrCreateChatRoom = async (user1Id: string, user2Id: string): Promise<string> => {
    // Determine unique ID for the pair
    const chatId = [user1Id, user2Id].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
        await setDoc(chatRef, {
            id: chatId,
            participants: [user1Id, user2Id],
            updatedAt: Date.now()
        } as ChatRoom);
    }

    return chatId;
};

export const sendPrivateMessage = async (
    chatId: string, 
    senderId: string, 
    senderName: string, 
    senderAvatar: string | undefined, 
    text: string,
    replyTo?: { id: string, name: string, text: string }
) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    
    // Add message
    await addDoc(messagesRef, {
        senderId,
        senderName,
        senderAvatar: senderAvatar || '',
        text,
        timestamp: Date.now(),
        type: 'text',
        replyToId: replyTo?.id || null,
        replyToName: replyTo?.name || null,
        replyToText: replyTo?.text || null
    });

    // Update room preview
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageAt: Date.now(),
        updatedAt: Date.now(),
        [`lastSeen.${senderId}`]: Date.now()
    });
};

export const subscribePrivateMessages = (
    chatId: string, 
    callback: (messages: ChatMessage[]) => void
) => {
    const q = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'asc'),
        limit(100)
    );

    return onSnapshot(q, (snap) => {
        const messages = snap.docs.map(d => ({
            id: d.id,
            ...d.data()
        } as ChatMessage));
        callback(messages);
    });
};

export const getMyChats = (
    userId: string, 
    callback: (rooms: ChatRoom[]) => void
) => {
    const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snap) => {
        const rooms = snap.docs.map(d => d.data() as ChatRoom);
        callback(rooms);
    });
};
