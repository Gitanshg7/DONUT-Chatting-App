package com.chatapp.websocket;

import com.chatapp.model.Message;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcastMessage(Message message) {
        messagingTemplate.convertAndSend("/topic/messages/" + message.getReceiver(), message);
    }
}
