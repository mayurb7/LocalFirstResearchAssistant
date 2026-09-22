package com.research.assistant.service;

import com.research.assistant.entity.Document;
import com.research.assistant.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

@Service
public class AiService {
    
    private final DocumentService documentService;
    private final DocumentRepository documentRepository;
    
    @Value("${spring.ai.google.genai.api-key:}")
    private String apiKey;

    @Value("${spring.ai.gemini.model:gemini-3.8-flash}")
    private String geminiModel;

    public AiService(DocumentService documentService, DocumentRepository documentRepository) {
        this.documentService = documentService;
        this.documentRepository = documentRepository;
    }

    public String analyzeDocuments(List<Long> documentIds, String query) {
        StringBuilder contextBuilder = new StringBuilder();
        
        for (Long docId : documentIds) {
            try {
                Document doc = documentRepository.findById(docId)
                        .orElseThrow(() -> new IllegalArgumentException("Doc not found"));
                
                String text = documentService.extractTextFromPdf(doc.getFilePath());
                contextBuilder.append("--- Document: ").append(doc.getTitle()).append(" ---\n");
                contextBuilder.append(text).append("\n\n");
            } catch (Exception e) {
                contextBuilder.append("--- Error reading document ID ").append(docId).append(" ---\n");
            }
        }
        
        String fullContext = contextBuilder.toString();
        
        String systemPrompt = "You are a helpful research assistant. Use the following document contexts to answer the user's query.\n\nContext:\n" + fullContext;
        
        try {
            if (apiKey == null || apiKey.isEmpty() || apiKey.equals("placeholder-key")) {
                return "Mock AI Response: Your API key is not configured properly, but here is a mock response based on the document!\n\nContext Length: " + fullContext.length() + " chars.\nQuestion: " + query;
            }

            String formattedModel = (geminiModel != null && !geminiModel.isBlank()) ? geminiModel.trim().toLowerCase().replace(" ", "-") : "gemini-3.8-flash";
            if (!formattedModel.startsWith("gemini-")) {
                formattedModel = "gemini-" + formattedModel;
            }

            String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + formattedModel + ":generateContent?key=" + apiKey;
            
            // Escape quotes for JSON
            String safeSystemPrompt = systemPrompt.replace("\"", "\\\"").replace("\n", "\\n");
            String safeQuery = query.replace("\"", "\\\"").replace("\n", "\\n");
            
            String requestBody = "{\n" +
                    "  \"contents\": [\n" +
                    "    {\n" +
                    "      \"parts\": [\n" +
                    "        {\"text\": \"" + safeSystemPrompt + "\\n\\nUser Query: " + safeQuery + "\"}\n" +
                    "      ]\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}";

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                // Extract text from Gemini JSON response manually to avoid new dependencies
                String resp = response.body();
                int textIdx = resp.indexOf("\"text\": \"");
                if (textIdx != -1) {
                    int start = textIdx + 9;
                    int end = resp.indexOf("\"", start);
                    String resultText = resp.substring(start, end).replace("\\n", "\n").replace("\\\"", "\"");
                    return resultText;
                }
                return "Could not parse response: " + resp;
            } else {
                return "API Error (" + response.statusCode() + "): " + response.body();
            }
        } catch (Exception e) {
            return "Error calling AI API: " + e.getMessage();
        }
    }
}
