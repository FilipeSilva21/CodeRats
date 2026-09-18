package com.devrats.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket:squads}")
    private String bucketName;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".png";
            String filename = UUID.randomUUID().toString() + extension;

            String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filename;

            String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uploadUrl))
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("apikey", supabaseKey)
                    .header("Content-Type", contentType)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                // Sucesso! Retorna a URL pública da imagem
                return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + filename;
            } else {
                System.err.println("[SUPABASE STORAGE] Error uploading image: " + response.body());
                throw new RuntimeException("Failed to upload image to Supabase: " + response.body());
            }

        } catch (Exception e) {
            System.err.println("[SUPABASE STORAGE] Exception during upload: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to upload image", e);
        }
    }
}
