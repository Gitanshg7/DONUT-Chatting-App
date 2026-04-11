package com.chatapp.controller;

import com.chatapp.model.Message;
import com.chatapp.service.MessageService;
import com.chatapp.websocket.WebSocketController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/messages")
public class MessageController {

    private final MessageService messageService;
    private final WebSocketController webSocketController;

    public MessageController(MessageService messageService, WebSocketController webSocketController) {
        this.messageService = messageService;
        this.webSocketController = webSocketController;
    }

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody Map<String, String> request,
                                               Authentication authentication) {
        String sender = authentication.getName();
        String receiver = request.get("receiverUsername");
        String content = request.get("content");
        String type = request.getOrDefault("type", "TEXT");
        String fileUrl = request.get("fileUrl");

        if (receiver == null || receiver.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Receiver username must not be empty");
        }

        // TEXT messages require content; file-based messages require fileUrl
        if ("TEXT".equals(type)) {
            if (content == null || content.trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message content must not be empty");
            }
        } else {
            if (fileUrl == null || fileUrl.trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File URL must not be empty for " + type + " messages");
            }
        }

        Message message = messageService.saveMessage(sender, receiver, content, type, fileUrl);
        webSocketController.broadcastMessage(message);

        return ResponseEntity.ok(message);
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<Message>> getChatHistory(@PathVariable String username,
                                                        Authentication authentication) {
        String currentUser = authentication.getName();
        List<Message> messages = messageService.getChatHistory(currentUser, username);
        return ResponseEntity.ok(messages);
    }
}
