import { apiClient, getApiErrorMessage } from "../client";

/**
 * Membership API Service
 * Handles family member creation and membership registration
 */

export interface CreateFamilyMemberAdult {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

export interface CreateFamilyMemberChild {
  firstname: string;
  lastname: string;
  birthday: string; // ISO date string
}

export interface CreateMembershipRequest {
  adults: CreateFamilyMemberAdult[];
  children?: CreateFamilyMemberChild[];
}

export interface CreateMembershipResponse {
  success: boolean;
  message: string;
  payment_amount: number;
  payment_reference: string;
}

/**
 * Create new membership with family members
 * This endpoint creates a new family with adults and optionally children
 */
export async function createMembership(
  data: CreateMembershipRequest
): Promise<CreateMembershipResponse> {
  try {
    const response = await apiClient.post<CreateMembershipResponse>(
      "/membership/create/",
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
