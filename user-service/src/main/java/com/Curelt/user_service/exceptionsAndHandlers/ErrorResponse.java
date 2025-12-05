package com.Curelt.user_service.exceptionsAndHandlers;

import java.util.Map;

public record ErrorResponse(Map<String, String> errors) {
}
