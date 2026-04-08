package com.chatapp.repository;

import com.chatapp.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findTop20BySenderAndReceiverOrSenderAndReceiverOrderByTimestampDesc(
            String sender1, String receiver1,
            String sender2, String receiver2
    );
}
