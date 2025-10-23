import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data, error.message)
    return Promise.reject(error)
  }
)

// Event types enum
export const EventType = {
  CROSSPROMO: 'crosspromo',
  LIVEOPS: 'liveops',
  APP: 'app',
  ADS: 'ads'
}

// API service for events
export const eventsApi = {
  // Test backend connectivity
  async testConnection() {
    try {
      console.log('Testing backend connectivity...')
      const response = await api.get('/')
      console.log('Backend connection successful:', response.data)
      return true
    } catch (error) {
      console.error('Backend connection failed:', error)
      return false
    }
  },

  // Get all events
  async getEvents() {
    console.log('API: Making request to GET /events');
    try {
      const response = await api.get('/events')
      console.log('API: Response received:', response);
      console.log('API: Response data:', response.data);
      return response.data
    } catch (error) {
      console.error('API: Error fetching events:', error)
      
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        throw new Error('Backend server is not running. Please start the backend server.')
      }
      
      if (error.response) {
        // Server responded with error status
        console.error('API: Server responded with error:', error.response.status, error.response.data)
        throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`)
      } else if (error.request) {
        // Request was made but no response received
        console.error('API: No response received:', error.request)
        throw new Error('No response from server. Check if backend is running on http://localhost:3000')
      } else {
        // Something else happened
        throw new Error(`Request failed: ${error.message}`)
      }
    }
  },

  // Get event by ID
  async getEvent(id) {
    try {
      const response = await api.get(`/events/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching event:', error)
      if (error.response?.status === 404) {
        throw new Error('Event not found')
      }
      throw new Error('Failed to fetch event')
    }
  },

  // Create new event
  async createEvent(eventData) {
    try {
      const response = await api.post('/events', eventData)
      return response.data
    } catch (error) {
      console.error('Error creating event:', error)
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid event data')
      }
      if (error.response?.status === 409) {
        throw new Error('Event name already exists')
      }
      throw new Error('Failed to create event')
    }
  },

  // Update event
  async updateEvent(id, eventData) {
    try {
      const response = await api.put(`/events/${id}`, eventData)
      return response.data
    } catch (error) {
      console.error('Error updating event:', error)
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid event data')
      }
      if (error.response?.status === 404) {
        throw new Error('Event not found')
      }
      if (error.response?.status === 409) {
        throw new Error('Event name already exists')
      }
      throw new Error('Failed to update event')
    }
  },

  // Delete event
  async deleteEvent(id) {
    try {
      await api.delete(`/events/${id}`)
    } catch (error) {
      console.error('Error deleting event:', error)
      if (error.response?.status === 404) {
        throw new Error('Event not found')
      }
      throw new Error('Failed to delete event')
    }
  },

  // Check ads permission
  async checkAdsPermission() {
    try {
      const response = await api.get('/events/ads-permission')
      return response.data.canCreateAds
    } catch (error) {
      console.error('Error checking ads permission:', error)
      // Default to false if we can't check permission
      return false
    }
  }
}

export default api