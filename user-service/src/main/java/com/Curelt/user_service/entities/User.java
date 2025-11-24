package com.Curelt.user_service.entities;

import com.Curelt.user_service.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Table(name = "users")
@Entity
@Setter
@Getter
@Builder
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid default uuidv7()")
    private UUID id;

    private String firstName;
    private String lastName;

    @Column(nullable = false,unique = true)
    private String userName;

    @Column(nullable = false,unique = true)
    private String email;


    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(nullable = false)
    private String password;
    @OneToOne(optional = true)
    @JoinColumn(name = "profile_picture_id")
    private File profilePicture;
    @CreatedDate
    @Column( nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column( nullable = false)
    private LocalDateTime updatedAt;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_"+role.name()));
    }

    @Override
    public String getUsername() {
        return this.email;
    }
    @Override
    public String getPassword(){
        return this.password;
    }


}
