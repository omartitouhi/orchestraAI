package com.orchestraai.backend;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class HealthControllerTests {

	@Test
	void healthReportsOk() {
		assertThat(new HealthController().health()).containsEntry("status", "ok");
	}

}
