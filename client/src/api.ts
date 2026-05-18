import type { User, Project, Task } from './types';

const API_URL = 'http://localhost:3000';

// Authentication
export const registerUser = async (body:
    {email: string; 
    password: string;
    display_name: string}): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        throw new Error('Failed to register user');
    }
    return response.json();
};