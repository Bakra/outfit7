import { defineStore } from 'pinia'
import { eventsApi } from '../services/api.js'

export const useEventsStore = defineStore('events', {
  state: () => ({
    events: [],
    currentEvent: null,
    loading: false,
    error: null,
    canCreateAds: false
  }),

  getters: {
    getEventById: (state) => (id) => {
      return state.events.find(event => event.id === id)
    },
    
    eventCount: (state) => state.events.length,
    
    hasError: (state) => !!state.error
  },

  actions: {
    // Set loading state
    setLoading(loading) {
      this.loading = loading
    },

    // Set error message
    setError(error) {
      this.error = error
    },

    // Clear error
    clearError() {
      this.error = null
    },

    // Fetch all events
    async fetchEvents() {
      console.log('Store: Starting to fetch events...');
      this.setLoading(true)
      this.clearError()
      
      try {
        const fetchedEvents = await eventsApi.getEvents()
        console.log('Store: API returned events:', fetchedEvents);
        this.events = fetchedEvents
        console.log('Store: Events stored:', this.events);
      } catch (error) {
        console.error('Store: Error fetching events:', error);
        this.setError(error.message)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Fetch single event
    async fetchEvent(id) {
      this.setLoading(true)
      this.clearError()
      
      try {
        this.currentEvent = await eventsApi.getEvent(id)
        return this.currentEvent
      } catch (error) {
        this.setError(error.message)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Create new event
    async createEvent(eventData) {
      this.setLoading(true)
      this.clearError()
      
      try {
        const newEvent = await eventsApi.createEvent(eventData)
        this.events.push(newEvent)
        return newEvent
      } catch (error) {
        this.setError(error.message)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Update event
    async updateEvent(id, eventData) {
      this.setLoading(true)
      this.clearError()
      
      try {
        const updatedEvent = await eventsApi.updateEvent(id, eventData)
        const index = this.events.findIndex(event => event.id === id)
        if (index !== -1) {
          this.events[index] = updatedEvent
        }
        this.currentEvent = updatedEvent
        return updatedEvent
      } catch (error) {
        this.setError(error.message)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Delete event
    async deleteEvent(id) {
      this.setLoading(true)
      this.clearError()
      
      try {
        await eventsApi.deleteEvent(id)
        this.events = this.events.filter(event => event.id !== id)
        if (this.currentEvent?.id === id) {
          this.currentEvent = null
        }
      } catch (error) {
        this.setError(error.message)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Check ads permission
    async checkAdsPermission() {
      try {
        this.canCreateAds = await eventsApi.checkAdsPermission()
        return this.canCreateAds
      } catch (error) {
        console.warn('Could not check ads permission:', error.message)
        this.canCreateAds = false
        return false
      }
    }
  }
})