package com.Curelt.user_service.entities;

import com.Curelt.user_service.enums.FileType;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class File {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid default uuidv7()")
    private UUID id;

    private String url;
    private String publicId;

    @Enumerated(EnumType.STRING)
    private FileType type ;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

}
