package com.Curelt.user_service.exceptionsAndHandlers;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@ControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException exp) {
		var errors = new HashMap<String, String>();
		exp.getBindingResult().getAllErrors().forEach(error -> {
			var fieldName = ((FieldError) error).getField();
			var errorMessage = error.getDefaultMessage();
			errors.put(fieldName, errorMessage);
		});

		return ResponseEntity.status(BAD_REQUEST).body(new ErrorResponse(errors));
	}

	@ExceptionHandler({ IllegalArgumentException.class, DuplicatedEmailException.class,
			DuplicatedUsernameException.class, UserNotFoundException.class })
	public ResponseEntity<String> handleBadRequestExceptions(RuntimeException exp) {
		return ResponseEntity.status(BAD_REQUEST).body(exp.getMessage());
	}

	@ExceptionHandler({ HttpMessageNotReadableException.class })
	public ResponseEntity<String> handleHttpMessageNotReadableException(HttpMessageNotReadableException exp) {
		return ResponseEntity.status(BAD_REQUEST).body(exp.getMessage());
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<ErrorResponse> handleConstraintViolationException(ConstraintViolationException exp) {
		var errors = new HashMap<String, String>();

		exp.getConstraintViolations().forEach(violation -> {
			String fieldName = violation.getPropertyPath().toString();
			String message = violation.getMessage();
			errors.put(fieldName, message);
		});

		return ResponseEntity.status(BAD_REQUEST).body(new ErrorResponse(errors));
	}

	@ExceptionHandler(InvalidOtpException.class)
	public ResponseEntity<String> handleInvalidOtpException(InvalidOtpException exp) {
		return ResponseEntity.status(BAD_REQUEST).body(exp.getMessage());
	}

	@ExceptionHandler(OtpExpiredException.class)
	public ResponseEntity<String> handleOtpExpiredException(OtpExpiredException exp) {
		return ResponseEntity.status(HttpStatus.GONE) // 410
				.body(exp.getMessage());
	}
}
