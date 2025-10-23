import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { eventsApi, EventType } from '../src/services/api.js'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('Events API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock axios.create to return mocked axios instance
    mockedAxios.create = vi.fn(() => ({
      get: mockedAxios.get,
      post: mockedAxios.post,
      put: mockedAxios.put,
      delete: mockedAxios.delete,
    }))
  })

  describe('getEvents', () => {
    it('should fetch all events successfully', async () => {
      const mockEvents = [
        {
          id: '1',
          name: 'Test Event',
          description: 'Test Description',
          type: EventType.APP,
          priority: 5
        }
      ]
      
      mockedAxios.get.mockResolvedValueOnce({ data: mockEvents })

      const result = await eventsApi.getEvents()
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/events')
      expect(result).toEqual(mockEvents)
    })

    it('should throw error when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(eventsApi.getEvents()).rejects.toThrow('Failed to fetch events')
    })
  })

  describe('createEvent', () => {
    it('should create event successfully', async () => {
      const eventData = {
        name: 'New Event',
        description: 'New Description',
        type: EventType.APP,
        priority: 3
      }
      
      const mockResponse = { id: '1', ...eventData, createdAt: new Date(), updatedAt: new Date() }
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse })

      const result = await eventsApi.createEvent(eventData)
      
      expect(mockedAxios.post).toHaveBeenCalledWith('/events', eventData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle validation errors', async () => {
      const eventData = { name: '', description: '', type: '', priority: -1 }
      
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 400, data: { message: 'Validation failed' } }
      })

      await expect(eventsApi.createEvent(eventData)).rejects.toThrow('Validation failed')
    })

    it('should handle conflict errors', async () => {
      const eventData = {
        name: 'Existing Event',
        description: 'Description',
        type: EventType.APP,
        priority: 5
      }
      
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 409 }
      })

      await expect(eventsApi.createEvent(eventData)).rejects.toThrow('Event name already exists')
    })
  })

  describe('updateEvent', () => {
    it('should update event successfully', async () => {
      const eventId = '1'
      const updateData = { name: 'Updated Event' }
      const mockResponse = { id: eventId, ...updateData }
      
      mockedAxios.put.mockResolvedValueOnce({ data: mockResponse })

      const result = await eventsApi.updateEvent(eventId, updateData)
      
      expect(mockedAxios.put).toHaveBeenCalledWith(`/events/${eventId}`, updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle not found errors', async () => {
      mockedAxios.put.mockRejectedValueOnce({
        response: { status: 404 }
      })

      await expect(eventsApi.updateEvent('999', {})).rejects.toThrow('Event not found')
    })
  })

  describe('deleteEvent', () => {
    it('should delete event successfully', async () => {
      const eventId = '1'
      mockedAxios.delete.mockResolvedValueOnce({})

      await eventsApi.deleteEvent(eventId)
      
      expect(mockedAxios.delete).toHaveBeenCalledWith(`/events/${eventId}`)
    })

    it('should handle not found errors', async () => {
      mockedAxios.delete.mockRejectedValueOnce({
        response: { status: 404 }
      })

      await expect(eventsApi.deleteEvent('999')).rejects.toThrow('Event not found')
    })
  })

  describe('checkAdsPermission', () => {
    it('should return true when ads are allowed', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { canCreateAds: true }
      })

      const result = await eventsApi.checkAdsPermission()
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/events/ads-permission')
      expect(result).toBe(true)
    })

    it('should return false when ads are not allowed', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { canCreateAds: false }
      })

      const result = await eventsApi.checkAdsPermission()
      expect(result).toBe(false)
    })

    it('should return false when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))

      const result = await eventsApi.checkAdsPermission()
      expect(result).toBe(false)
    })
  })
})