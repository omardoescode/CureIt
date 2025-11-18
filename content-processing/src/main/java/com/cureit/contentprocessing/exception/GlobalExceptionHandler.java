package com.cureit.contentprocessing.exception;

import com.cureit.contentprocessing.dto.ErrorResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;


@ControllerAdvice
public class GlobalExceptionHandler {

    // handling custom ApiException
    @ExceptionHandler(ApiException.class)
    public ErrorResponse handleApiException(ApiException ex) {
        return buildErrorResponse(ex.getMessage(), ex.getCode(), ex.getDetails());
    }

    // handling any unexpected exception
    @ExceptionHandler(Exception.class)
    public ErrorResponse handleUnexpected(Exception ex) {
        return buildErrorResponse(
                ex.getMessage(),
                "INTERNAL_SERVER_ERROR",
                null
        );
    }

    private ErrorResponse buildErrorResponse(
            String message,
            String code,
            Map<String, Object> details
    ) {
        ErrorResponse body = ErrorResponse.builder()
                .message(message)
                .code(code)
                .details(details)
                .build();

        return body;
    }
}
