package com.auth.backend.service;

import com.auth.backend.dto.Claim;
import com.auth.backend.dto.Contract;
import com.auth.backend.dto.User;

import com.auth.backend.repository.ClaimRepository;
import com.auth.backend.repository.ContractRepository;
import com.auth.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ContractRepository contractRepository;
    private final ClaimRepository claimRepository;

    // ── Users ──────────────────────────────────────────────────

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> searchUsers(String keyword) {
        return userRepository.searchUsers(keyword);
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }
    public User getUserByUsername(String username){
        try{
            return userRepository.findByUsername(username).get();
        }catch(Exception e){
            e.printStackTrace();
            return null;
        }
    }
    public User setUserFullName(String username, String fullName){
        try{
            User user = userRepository.findByUsername(username).get();
            user.setEmail(fullName);
            return userRepository.save(user);
        }catch(Exception e){
            System.out.println("Error Updating Fullname");
            e.printStackTrace();
            return null;
        }
    }
    public User setUserPhoneNumber(String username, String number){
        try{
            User user = userRepository.findByUsername(username).get();
            user.setPhone(number);
            return userRepository.save(user);
        }catch(Exception e){
            System.out.println("Error Updating Fullname");
            e.printStackTrace();
            return null;
        }
    }
    public User setUserEmail(String username, String email){
        try{
            User user = userRepository.findByUsername(username).get();
            user.setEmail(email);
            return userRepository.save(user);
        }catch(Exception e){
            System.out.println("Error Updating Fullname");
            e.printStackTrace();
            return null;
        }
    }
    public User setPassword(String username, String currentPassword, String newPassword){
        try{
            User user = userRepository.findByUsername(username).get();
            if(user.getPassword().equals(currentPassword)){
                user.setPassword(newPassword);                
                return userRepository.save(user);
            }
            throw new Exception("Password Current Password mismatch");
        }catch(Exception e){
            System.out.println("Error Updating Fullname");
            e.printStackTrace();
            return null;
        }
    }
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // ── Contracts ──────────────────────────────────────────────

    public List<Contract> getClientContract(String contractNumber) {
        return contractRepository.findByContractNumber(contractNumber);
    }
    public List<Contract> getAllContracts() {
        return contractRepository.findAll();
    }
    public Contract createContractForClient(Contract contract){
        return contractRepository.save(contract);
    }
    // ── Claims ─────────────────────────────────────────────────
    public List<Claim> findClaims(){
        return claimRepository.findAll();
    }
}