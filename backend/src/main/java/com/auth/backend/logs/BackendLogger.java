package com.auth.backend.logs;

public class BackendLogger {

    // ANSI color codes as constants (no need to redeclare every call)
    private static final String RED    = "\u001B[31m";
    private static final String YELLOW = "\u001B[33m";
    private static final String CYAN   = "\u001B[36m";
    private static final String RESET  = "\u001B[0m";

    public static void logError(String header, String location, Exception e) {
        String logFile = "error_logs.log";
        String timestamp = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        // Console output (with colors)
        System.err.println(RED    + "\n==============================" + RESET);
        System.err.println(YELLOW + " " + header                      + RESET);
        System.err.println(CYAN   + " Date: " + timestamp             + RESET);
        System.err.println(RED    + "=============================="   + RESET);
        System.err.println(YELLOW + " Location : " + location         + RESET);
        System.err.println(RED    + " Error    : " + e.getMessage()   + RESET);
        System.err.println(RED    + "------------------------------>"  + RESET);

        // File output (no colors, clean text)
        String logEntry = "\n" +
                "==============================\n" +
                " " + header + "\n" +
                " Date: " + timestamp + "\n" +
                "==============================\n" +
                " Location : " + location + "\n" +
                " Error    : " + e.getMessage() + "\n" +
                "------------------------------>\n";

        try (java.io.FileWriter fw = new java.io.FileWriter(logFile, true)) {
            fw.write(logEntry);
        } catch (java.io.IOException ioException) {
            System.err.println("Failed to write to log file: " + ioException.getMessage());
        }
    }
    public static void main(String[] args) {
        // Example usage
        try {
            throw new Exception("This is a test error");
        } catch (Exception e) {
            logError("Test Error", "BackendLogger.java", e);
        }
    }
}