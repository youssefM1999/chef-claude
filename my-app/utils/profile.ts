/// <reference types="vite/client" />

const apiBaseUrl = import.meta.env.DEV ? 'http://localhost:4000/api' : import.meta.env.VITE_API_URL;

import supabase from "./supabase";

export interface Profile {
    id: string;
    name: string;
    email: string;
}

export async function postProfileToDatabase(profile: Profile): Promise<void> {
    
    try {
        console.log('Getting session for profile save...');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            throw new Error('User not authenticated');
        }
        console.log('Session found, making API call to:', `${apiBaseUrl}/profiles`);
        const apiUrl = `${apiBaseUrl}/profiles`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(profile),
        });
        console.log('API response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            
            // Handle 409 Conflict (profile already exists) as a non-error case
            if (response.status === 409) {
                console.log('Profile already exists');
                return; // Don't throw error for existing profiles
            }
            
            throw new Error(`Failed to save profile: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        console.log('Profile saved successfully:', data);
    } catch (error) {
        console.error('Error saving profile:', error);
        throw error;
    }
}
