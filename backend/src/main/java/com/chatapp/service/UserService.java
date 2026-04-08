package com.chatapp.service;

import com.chatapp.model.User;
import com.chatapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<String> getAllUsersExcept(String currentUsername) {
        return userRepository.findAll()
                .stream()
                .map(User::getUsername)
                .filter(username -> !username.equals(currentUsername))
                .collect(Collectors.toList());
    }
}
