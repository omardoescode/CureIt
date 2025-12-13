package com.cureit.interactionservice.exception;

import com.cureit.interactionservice.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MissingHeaderException.class)
    public ResponseEntity<ErrorResponse> handleMissingHeader(MissingHeaderException ex) {
        return ResponseEntity.badRequest().body(
                buildErrorResponse(ex.getMessage(), ex.getCode(), Map.of("reason", ex.getHeader()))
        );
    }

    // handling any unexpected exception
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        return ResponseEntity.badRequest().body(
                buildErrorResponse(
                        ex.getMessage(),
                        "INTERNAL_SERVER_ERROR",
                        null
                )
        );
    }

    private ErrorResponse buildErrorResponse(
            String message,
            String code,
            Map<String, Object> details
    ) {
        return ErrorResponse.builder()
                .message(message)
                .code(code)
                .details(details)
                .build();
    }
}
