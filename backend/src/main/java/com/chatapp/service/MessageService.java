package com.chatapp.service;

import com.chatapp.model.Message;
import com.chatapp.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public Message saveMessage(String sender, String receiver, String content) {
        Message message = new Message(sender, receiver, content, LocalDateTime.now());
        return messageRepository.save(message);
    }

    public Message saveMessage(String sender, String receiver, String content, String type, String fileUrl) {
        Message message = new Message(sender, receiver, content, type, fileUrl, LocalDateTime.now());
        return messageRepository.save(message);
    }

    public List<Message> getChatHistory(String currentUser, String otherUser) {
        return messageRepository.findTop20BySenderAndReceiverOrSenderAndReceiverOrderByTimestampDesc(
                currentUser, otherUser,
                otherUser, currentUser
        );
    }
}
