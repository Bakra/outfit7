import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useEventsStore } from "../src/stores/events.js";
import { eventsApi } from "../src/services/api.js";

// Mock the API service
vi.mock("../src/services/api.js", () => ({
  eventsApi: {
    getEvents: vi.fn(),
    getEvent: vi.fn(),
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
    checkAdsPermission: vi.fn(),
  },
  EventType: {
    APP: "app",
    LIVEOPS: "liveops",
    CROSSPROMO: "crosspromo",
    ADS: "ads",
  },
}));

describe("Events Store", () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useEventsStore();
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      expect(store.events).toEqual([]);
      expect(store.currentEvent).toBe(null);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(null);
      expect(store.canCreateAds).toBe(false);
    });
  });

  describe("getters", () => {
    it("should find event by id", () => {
      store.events = [
        { id: "1", name: "Event 1" },
        { id: "2", name: "Event 2" },
      ];

      const event = store.getEventById("1");
      expect(event).toEqual({ id: "1", name: "Event 1" });
    });

    it("should return correct event count", () => {
      store.events = [{ id: "1" }, { id: "2" }, { id: "3" }];
      expect(store.eventCount).toBe(3);
    });

    it("should detect error state", () => {
      expect(store.hasError).toBe(false);
      store.error = "Some error";
      expect(store.hasError).toBe(true);
    });
  });

  describe("actions", () => {
    describe("fetchEvents", () => {
      it("should fetch events successfully", async () => {
        const mockEvents = [
          { id: "1", name: "Event 1" },
          { id: "2", name: "Event 2" },
        ];
        eventsApi.getEvents.mockResolvedValueOnce(mockEvents);

        await store.fetchEvents();

        expect(store.loading).toBe(false);
        expect(store.events).toEqual(mockEvents);
        expect(store.error).toBe(null);
        expect(eventsApi.getEvents).toHaveBeenCalledOnce();
      });

      it("should handle fetch errors", async () => {
        const errorMessage = "Failed to fetch";
        eventsApi.getEvents.mockRejectedValueOnce(new Error(errorMessage));

        await expect(store.fetchEvents()).rejects.toThrow(errorMessage);
        expect(store.loading).toBe(false);
        expect(store.error).toBe(errorMessage);
      });
    });

    describe("createEvent", () => {
      it("should create event successfully", async () => {
        const eventData = { name: "New Event", description: "Description" };
        const createdEvent = { id: "1", ...eventData };
        eventsApi.createEvent.mockResolvedValueOnce(createdEvent);

        const result = await store.createEvent(eventData);

        expect(result).toEqual(createdEvent);
        expect(store.events).toEqual([createdEvent]);
        expect(store.loading).toBe(false);
        expect(store.error).toBe(null);
      });

      it("should handle create errors", async () => {
        const errorMessage = "Creation failed";
        eventsApi.createEvent.mockRejectedValueOnce(new Error(errorMessage));

        await expect(store.createEvent({})).rejects.toThrow(errorMessage);
        expect(store.loading).toBe(false);
        expect(store.error).toBe(errorMessage);
      });
    });

    describe("updateEvent", () => {
      it("should update event successfully", async () => {
        const originalEvent = { id: "1", name: "Original" };
        const updatedEvent = { id: "1", name: "Updated" };
        store.events = [originalEvent];

        eventsApi.updateEvent.mockResolvedValueOnce(updatedEvent);

        const result = await store.updateEvent("1", { name: "Updated" });

        expect(result).toEqual(updatedEvent);
        expect(store.events[0]).toEqual(updatedEvent);
        expect(store.currentEvent).toEqual(updatedEvent);
      });
    });

    describe("deleteEvent", () => {
      it("should delete event successfully", async () => {
        const eventToDelete = { id: "1", name: "Event 1" };
        const eventToKeep = { id: "2", name: "Event 2" };
        store.events = [eventToDelete, eventToKeep];
        store.currentEvent = eventToDelete;

        eventsApi.deleteEvent.mockResolvedValueOnce();

        await store.deleteEvent("1");

        expect(store.events).toEqual([eventToKeep]);
        expect(store.currentEvent).toBe(null);
        expect(eventsApi.deleteEvent).toHaveBeenCalledWith("1");
      });
    });

    describe("checkAdsPermission", () => {
      it("should check ads permission successfully", async () => {
        eventsApi.checkAdsPermission.mockResolvedValueOnce(true);

        const result = await store.checkAdsPermission();

        expect(result).toBe(true);
        expect(store.canCreateAds).toBe(true);
      });

      it("should handle permission check errors", async () => {
        eventsApi.checkAdsPermission.mockRejectedValueOnce(
          new Error("Network error")
        );

        const result = await store.checkAdsPermission();

        expect(result).toBe(false);
        expect(store.canCreateAds).toBe(false);
      });
    });
  });
});
