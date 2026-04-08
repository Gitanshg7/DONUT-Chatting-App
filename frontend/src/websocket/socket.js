import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

export function connectWebSocket(token, username, onMessageReceived, onOnlineUsersUpdate) {
  if (stompClient && stompClient.connected) {
    return;
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    onConnect: () => {
      // Subscribe to personal messages topic
      stompClient.subscribe(`/topic/messages/${username}`, (message) => {
        const parsedMessage = JSON.parse(message.body);
        if (onMessageReceived) {
          onMessageReceived(parsedMessage);
        }
      });

      // Subscribe to online users updates
      stompClient.subscribe('/topic/online-users', (message) => {
        const onlineUsers = JSON.parse(message.body);
        if (onOnlineUsersUpdate) {
          onOnlineUsersUpdate(onlineUsers);
        }
      });
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame.headers['message']);
    },
  });

  stompClient.activate();
}

export function disconnectWebSocket() {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
}

export function isConnected() {
  return stompClient && stompClient.connected;
}
