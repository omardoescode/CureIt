package com.Curelt.user_service.service;

import com.Curelt.user_service.entities.File;
import com.Curelt.user_service.entities.User;
import com.Curelt.user_service.enums.FileType;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    File handleFileUpload(MultipartFile mf, FileType type, User user);

}
