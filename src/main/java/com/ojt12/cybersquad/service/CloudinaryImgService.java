package com.ojt12.cybersquad.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
/*KZL*/

@Service
public interface CloudinaryImgService {
    String uploadFile (MultipartFile multipartFile) throws IOException;
    String uploadVoice(MultipartFile multipartFile) throws IOException;

    String uploadVideo(MultipartFile multipartFile) throws IOException;
    Boolean deleteFile(String imgUrl);

}
/*KZL*/

