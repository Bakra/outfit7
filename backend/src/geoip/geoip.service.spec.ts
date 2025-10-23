import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { GeoipService } from './geoip.service';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GeoipService', () => {
  let service: GeoipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeoipService],
    }).compile();

    service = module.get<GeoipService>(GeoipService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserCountryCode', () => {
    it('should return country code for successful response', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          country: 'United States',
          countryCode: 'US',
          query: '192.168.1.1',
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getUserCountryCode('192.168.1.1');
      expect(result).toBe('US');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://ip-api.com/json/192.168.1.1',
        expect.objectContaining({
          timeout: 5000,
          params: {
            fields: 'status,country,countryCode,query'
          }
        })
      );
    });

    it('should throw HttpException for failed response', async () => {
      const mockResponse = {
        data: {
          status: 'fail',
          message: 'Invalid IP',
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await expect(service.getUserCountryCode('invalid-ip')).rejects.toThrow(
        new HttpException('Failed to get location information', HttpStatus.SERVICE_UNAVAILABLE)
      );
    });

    it('should throw HttpException for axios error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(service.getUserCountryCode()).rejects.toThrow(
        new HttpException('GeoIP service temporarily unavailable', HttpStatus.SERVICE_UNAVAILABLE)
      );
    });
  });

  describe('checkAdsPermission', () => {
    it('should return true when ads are allowed', async () => {
      const mockResponse = {
        data: {
          ads: 'sure, why not!',
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.checkAdsPermission('US');
      expect(result).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://europe-west1-o7tools.cloudfunctions.net/fun7-ad-partner-expertise-test',
        expect.objectContaining({
          timeout: 5000,
          params: { countryCode: 'US' },
          auth: {
            username: 'fun7user',
            password: 'fun7pass'
          }
        })
      );
    });

    it('should return false when ads are not allowed', async () => {
      const mockResponse = {
        data: {
          ads: 'you shall not pass!',
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.checkAdsPermission('DE');
      expect(result).toBe(false);
    });

    it('should handle 400 Bad Request', async () => {
      const axiosError = {
        response: { status: 400 },
        isAxiosError: true,
      };

      mockedAxios.get.mockRejectedValueOnce(axiosError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(service.checkAdsPermission('INVALID')).rejects.toThrow(
        new HttpException('Invalid country code', HttpStatus.BAD_REQUEST)
      );
    });

    it('should handle 401 Unauthorized', async () => {
      const axiosError = {
        response: { status: 401 },
        isAxiosError: true,
      };

      mockedAxios.get.mockRejectedValueOnce(axiosError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(service.checkAdsPermission('US')).rejects.toThrow(
        new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED)
      );
    });

    it('should handle 500 Server Error', async () => {
      const axiosError = {
        response: { status: 500 },
        isAxiosError: true,
      };

      mockedAxios.get.mockRejectedValueOnce(axiosError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(service.checkAdsPermission('US')).rejects.toThrow(
        new HttpException('Ads permission service temporarily unavailable', HttpStatus.SERVICE_UNAVAILABLE)
      );
    });

    it('should return false for unknown errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Unknown error'));
      mockedAxios.isAxiosError.mockReturnValueOnce(false);

      // Spy on console.error to verify logging
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await service.checkAdsPermission('US');
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Ads permission check failed:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('getAdsPermissionForIP', () => {
    it('should return true when both GeoIP and ads permission succeed', async () => {
      const geoResponse = {
        data: {
          status: 'success',
          countryCode: 'US',
        },
      };

      const adsResponse = {
        data: {
          ads: 'sure, why not!',
        },
      };

      mockedAxios.get
        .mockResolvedValueOnce(geoResponse)
        .mockResolvedValueOnce(adsResponse);

      const result = await service.getAdsPermissionForIP('192.168.1.1');
      expect(result).toBe(true);
    });

    it('should return false when GeoIP fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('GeoIP error'));
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      // Spy on console.error to verify logging
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await service.getAdsPermissionForIP('192.168.1.1');
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to get ads permission for IP:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});