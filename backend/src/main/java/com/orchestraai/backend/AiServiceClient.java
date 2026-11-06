package com.orchestraai.backend;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
class AiServiceClient {

	private final RestClient restClient;

	@Autowired
	AiServiceClient(@Value("${ai-service.url}") String baseUrl) {
		this(RestClient.builder().baseUrl(baseUrl));
	}

	AiServiceClient(RestClient.Builder builder) {
		this.restClient = builder.build();
	}

	Completion complete(String prompt) {
		return restClient.post()
			.uri("/llm/complete")
			.body(Map.of("prompt", prompt))
			.retrieve()
			.body(Completion.class);
	}

	record Completion(String text, String model) {
	}

}
