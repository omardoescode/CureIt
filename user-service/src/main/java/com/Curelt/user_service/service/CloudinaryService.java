package com.Curelt.user_service.service;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {
    private final Cloudinary cloudinary;

    public Map<String, String> uploadFile(MultipartFile file) throws IOException {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "raw",
                            "type", "upload"
                    )
            );


            String imageUrl = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();

            Map<String, String> result = new HashMap<>();
            result.put("url", imageUrl);
            result.put("publicId", publicId);
            log.info("in cloudinary service class");
            return result;
        }catch (Exception e) {
            System.out.println("Exception occured");
            throw new IOException(e.getMessage());
        }
    }
    public boolean deleteFile(String filePublicId) throws IOException {
        try{
            Map result=cloudinary.uploader().destroy(filePublicId, ObjectUtils.emptyMap());
            return "ok".equals(result.get("status"));
        } catch (Exception e) {
            throw new IOException(e.getMessage());
        }
    }
}
