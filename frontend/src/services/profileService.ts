import api, { handleApiError } from './api';

export interface UserProfile {
    username: string;
    displayName: string;
    bio: string;
    location: string;
    avatarUrl: string;
    joinedAt: string;
    email?: string; // Only present for "me"
    fullName?: string; // Potential backend mismatch
    name?: string;     // Potential backend mismatch
    stats?: {
        projects: number;
        roomsJoined: number;
        contributions: number;
    }
}

export interface ProfileUpdateDTO {
    displayName?: string;
    bio?: string;
    location?: string;
}

export interface UsernameUpdateDTO {
    username: string;
}

export interface AvatarUpdateDTO {
    avatarUrl: string;
}

export const profileService = {
    // 1.1 Public Profile
    getPublicProfile: async (username: string): Promise<UserProfile> => {
        try {
            const response = await api.get(`/api/profiles/${username}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 1.2 Private Profile
    getMyProfile: async (): Promise<UserProfile> => {
        try {
            const response = await api.get('/api/profiles/me');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 1.3 Update Profile (Safe fields)
    updateProfile: async (data: ProfileUpdateDTO): Promise<void> => {
        try {
            await api.put('/api/profiles/me', data);
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 1.4 Update Username
    updateUsername: async (data: UsernameUpdateDTO): Promise<void> => {
        try {
            await api.put('/api/profiles/me/username', data);
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 1.5 Update Avatar
    updateAvatar: async (data: AvatarUpdateDTO): Promise<void> => {
        try {
            await api.put('/api/profiles/me/avatar', data);
        } catch (error) {
            throw handleApiError(error);
        }
    }
};
