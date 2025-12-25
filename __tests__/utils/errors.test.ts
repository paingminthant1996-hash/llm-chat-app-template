import { describe, it, expect } from '@jest/globals';
import { AppError, getErrorMessage, getErrorCode, getErrorStatusCode, ErrorMessages } from '@/lib/utils/errors';

describe('Error Utilities', () => {
  describe('AppError', () => {
    it('should create an AppError with message', () => {
      const error = new AppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('AppError');
    });

    it('should create an AppError with code and statusCode', () => {
      const error = new AppError('Test error', 'TEST_CODE', 404);
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(404);
    });

    it('should create an AppError with userMessage', () => {
      const error = new AppError('Test error', undefined, undefined, 'User-friendly message');
      expect(error.userMessage).toBe('User-friendly message');
    });
  });

  describe('getErrorMessage', () => {
    it('should return userMessage for AppError', () => {
      const error = new AppError('Technical error', undefined, undefined, 'User-friendly error');
      expect(getErrorMessage(error)).toBe('User-friendly error');
    });

    it('should return message for AppError without userMessage', () => {
      const error = new AppError('Test error');
      expect(getErrorMessage(error)).toBe('Test error');
    });

    it('should return message for standard Error', () => {
      const error = new Error('Standard error');
      expect(getErrorMessage(error)).toBe('Standard error');
    });

    it('should return string for string error', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should return default message for unknown error', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('getErrorCode', () => {
    it('should return code for AppError', () => {
      const error = new AppError('Test', 'TEST_CODE');
      expect(getErrorCode(error)).toBe('TEST_CODE');
    });

    it('should return undefined for non-AppError', () => {
      expect(getErrorCode(new Error('Test'))).toBeUndefined();
    });
  });

  describe('getErrorStatusCode', () => {
    it('should return statusCode for AppError', () => {
      const error = new AppError('Test', undefined, 404);
      expect(getErrorStatusCode(error)).toBe(404);
    });

    it('should return 500 for non-AppError', () => {
      expect(getErrorStatusCode(new Error('Test'))).toBe(500);
    });
  });

  describe('ErrorMessages', () => {
    it('should have all required error messages', () => {
      expect(ErrorMessages.NETWORK_ERROR).toBeDefined();
      expect(ErrorMessages.NOT_FOUND).toBeDefined();
      expect(ErrorMessages.UNAUTHORIZED).toBeDefined();
      expect(ErrorMessages.FORBIDDEN).toBeDefined();
      expect(ErrorMessages.SERVER_ERROR).toBeDefined();
      expect(ErrorMessages.VALIDATION_ERROR).toBeDefined();
      expect(ErrorMessages.TIMEOUT).toBeDefined();
      expect(ErrorMessages.UNKNOWN).toBeDefined();
    });
  });
});

