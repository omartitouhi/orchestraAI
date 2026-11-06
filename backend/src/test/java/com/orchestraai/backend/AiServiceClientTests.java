package com.orchestraai.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class AiServiceClientTests {

	@Test
	void completeSendsPromptAndReadsReply() {
		RestClient.Builder builder = RestClient.builder().baseUrl("http://ai-service:8000");
		MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
		server.expect(requestTo("http://ai-service:8000/llm/complete"))
			.andExpect(method(HttpMethod.POST))
			.andExpect(content().json("{\"prompt\":\"Hi\"}"))
			.andRespond(withSuccess("{\"text\":\"Bonjour !\",\"model\":\"ollama/llama3.2\"}", MediaType.APPLICATION_JSON));

		AiServiceClient.Completion reply = new AiServiceClient(builder).complete("Hi");

		assertThat(reply).isEqualTo(new AiServiceClient.Completion("Bonjour !", "ollama/llama3.2"));
		server.verify();
	}

}
