package com.cureit.contentprocessing.exception;

public class MissingHeaderException extends RuntimeException {
    private final String header;

    public MissingHeaderException(String header) {
        super("Header missing: " + header);
        this.header = header;
    }

    public String getHeader() { return header; }
}
