package com.orchestraai.backend;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class HelloController {

	private final AiServiceClient aiService;

	HelloController(AiServiceClient aiService) {
		this.aiService = aiService;
	}

	@PostMapping("/hello")
	AiServiceClient.Completion hello() {
		return aiService.complete("Say hello in French in one short sentence.");
	}

}
