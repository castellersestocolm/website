/**
 * Event API Service
 *
 * API functions for event management
 */

import { apiClient, getApiErrorMessage } from "../client";
import type { Event, PaginatedResponse } from "@/types/api";

/**
 * Get list of events (paginated)
 */
export async function getEvents(params?: {
  page?: number;
  page_size?: number;
  is_public?: boolean;
  event_type?: string;
}): Promise<PaginatedResponse<Event>> {
  try {
    const response = await apiClient.get<PaginatedResponse<Event>>("/event/", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Get single event by ID
 */
export async function getEvent(id: number): Promise<Event> {
  try {
    const response = await apiClient.get<Event>(`/event/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Create new event
 */
export async function createEvent(data: Partial<Event>): Promise<Event> {
  try {
    const response = await apiClient.post<Event>("/event/", data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Update event
 */
export async function updateEvent(
  id: number,
  data: Partial<Event>
): Promise<Event> {
  try {
    const response = await apiClient.patch<Event>(`/event/${id}/`, data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Delete event
 */
export async function deleteEvent(id: number): Promise<void> {
  try {
    await apiClient.delete(`/event/${id}/`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Register for an event
 */
export async function registerForEvent(
  eventId: number
): Promise<{ message: string }> {
  try {
    const response = await apiClient.post<{ message: string }>(
      `/event/${eventId}/register/`
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Unregister from an event
 */
export async function unregisterFromEvent(
  eventId: number
): Promise<{ message: string }> {
  try {
    const response = await apiClient.post<{ message: string }>(
      `/event/${eventId}/unregister/`
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
