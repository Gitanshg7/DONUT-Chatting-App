package com.chatapp.controller;

import com.chatapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<String>> getUsers(Authentication authentication) {
        String currentUsername = authentication.getName();
        List<String> users = userService.getAllUsersExcept(currentUsername);
        return ResponseEntity.ok(users);
    }
}
