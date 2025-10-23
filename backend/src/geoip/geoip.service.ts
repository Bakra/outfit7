import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

interface GeoIPResponse {
  status: string;
  country: string;
  countryCode: string;
  query: string;
}

interface AdsPermissionResponse {
  ads: string;
}

@Injectable()
export class GeoipService {
  private readonly IP_API_URL = 'http://ip-api.com/json';
  private readonly ADS_PERMISSION_URL = 'https://europe-west1-o7tools.cloudfunctions.net/fun7-ad-partner-expertise-test';
  private readonly AUTH_USERNAME = 'fun7user';
  private readonly AUTH_PASSWORD = 'fun7pass';

  /**
   * Get user's country code based on their IP address
   * @param ip - IP address to lookup (optional, uses request IP if not provided)
   */
  async getUserCountryCode(ip?: string): Promise<string> {
    try {
      // Handle localhost/development environment
      if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
        console.log('Development/localhost detected, using default country: US');
        return 'US'; // Default to US for development
      }
      
      const url = `${this.IP_API_URL}/${ip}`;
      
      console.log(`Making GeoIP request to: ${url}`);
      
      const response = await axios.get<GeoIPResponse>(url, {
        timeout: 5000,
        params: {
          fields: 'status,country,countryCode,query'
        }
      });

      console.log('GeoIP response:', response.data);

      if (response.data.status !== 'success') {
        console.warn('GeoIP service returned unsuccessful status:', response.data);
        throw new HttpException(
          'Failed to get location information',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      return response.data.countryCode;
    } catch (error) {
      console.error('Error in getUserCountryCode:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          console.warn('GeoIP service is unreachable, defaulting to US');
          return 'US'; // Fallback to US if service is unreachable
        }
        
        throw new HttpException(
          'GeoIP service temporarily unavailable',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
      throw error;
    }
  }

  /**
   * Check if ads type is available for the given country code
   * @param countryCode - ISO 3166-1 alpha-2 country code
   */
  async checkAdsPermission(countryCode: string): Promise<boolean> {
    try {
      const response = await axios.get<AdsPermissionResponse>(
        this.ADS_PERMISSION_URL,
        {
          timeout: 5000,
          params: { countryCode },
          auth: {
            username: this.AUTH_USERNAME,
            password: this.AUTH_PASSWORD
          }
        }
      );

      return response.data.ads === 'sure, why not!';
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new HttpException(
            'Invalid country code',
            HttpStatus.BAD_REQUEST
          );
        }
        if (error.response?.status === 401) {
          throw new HttpException(
            'Authentication failed',
            HttpStatus.UNAUTHORIZED
          );
        }
        if (error.response && error.response.status >= 500) {
          throw new HttpException(
            'Ads permission service temporarily unavailable',
            HttpStatus.SERVICE_UNAVAILABLE
          );
        }
      }
      
      // Log error and default to false if service is unavailable
      console.error('Ads permission check failed:', error);
      return false;
    }
  }

  /**
   * Get ads permission for user based on their IP
   * @param ip - User's IP address
   */
  async getAdsPermissionForIP(ip?: string): Promise<boolean> {
    try {
      console.log('Checking ads permission for IP:', ip || 'undefined');
      
      const countryCode = await this.getUserCountryCode(ip);
      console.log('Determined country code:', countryCode);
      
      const permission = await this.checkAdsPermission(countryCode);
      console.log('Ads permission result:', permission);
      
      return permission;
    } catch (error) {
      // Log error but don't throw - default to no ads permission if we can't determine location
      console.error('Failed to get ads permission for IP:', ip, error.message || error);
      
      // In development, default to allowing ads for easier testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: defaulting to allow ads');
        return true;
      }
      
      return false;
    }
  }
}