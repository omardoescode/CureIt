package com.Curelt.user_service.service.serviceImpl;

import com.Curelt.user_service.entities.File;
import com.Curelt.user_service.entities.User;
import com.Curelt.user_service.enums.FileType;
import com.Curelt.user_service.repository.FileRepository;
import com.Curelt.user_service.service.CloudinaryService;
import com.Curelt.user_service.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileServiceImpl implements FileService {
    private final CloudinaryService cloudinaryService;
    private final FileRepository fileRepository;


    @Override
    public File handleFileUpload(MultipartFile mf, FileType type, User user) {
        try {
            // ------------------ VALIDATION ------------------
            String contentType = mf.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("Only image files are allowed");
            }

            String filename = mf.getOriginalFilename();
            if (filename != null && !filename.matches("(?i).+\\.(png|jpg|jpeg|gif|bmp|webp)$")) {
                throw new IllegalArgumentException("Invalid image extension");
            }

            if (mf.getSize() > 5 * 1024 * 1024) { // max 5MB
                throw new IllegalArgumentException("File is too large. Max allowed size is 5MB");
            }


            Map<String, String> upload = cloudinaryService.uploadFile(mf);
            log.info("cloudinary deployed successfully");

            File file = new File();
            file.setType(type);
            file.setUrl(upload.get("url"));
            file.setPublicId(upload.get("publicId"));
            file.setUser(user);


            return fileRepository.save(file);

        } catch (IllegalArgumentException e) {
            throw e; // validation error
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to Cloudinary", e);
        }
    }

}
