import type { User, Project, Task, ActivityLog } from './types';

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


export const loginUser = async ( email: string, password: string): Promise<User> => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            credentials: 'include', // this route uses session
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        if(!response.ok) {
            throw new Error('Failed to login user')
        } 
        return response.json();
    };

export const logoutUser = async (): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
    throw new Error(data.error || 'Failed to logout');
  } return data;
};

export const getSession = async (): Promise<{userId: number}> => {
    const response = await fetch(`${API_URL}/session`, {
        method: 'GET',
        credentials: 'include'
    });

    const data = await response.json();
    if(!response.ok) {
        throw new Error(data.error || 'Session not created')
    } return data
};

export const getUserById = async (): Promise<User> => {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json(); //parse json in advance to be abale to read the error

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch user info');
  }

  return data;
}; 



  

// for projects: 

export const getProjects = async (): Promise<Project[]> => {
    const response = await fetch(`${API_URL}/projects`, {
        method: 'GET',
        credentials: 'include'
    });

    const data = await response.json();

    if(!response.ok) { throw new Error(data.error || 'Failed to receive projects')}
    return data;
};

export const getProjectById = async (projectId: number): Promise<Project> => {
const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch projects info');
  }

  return data;
}

export const createProject = async (body: {
    name: string;
    description: string;
    color?: string; // i do not always send the color
}): Promise<Project> => {
    const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type':'application/json'},
        body: JSON.stringify(body)
    });

    const data = await response.json();

    if(!response.ok) {throw new Error(data.error || 'failed to create the the project')};
    return data;
};

export const updateProject = async (projectId: number, body: {

    name?: string;
    description?: string;
    color?: string;
    status?: string;
}): Promise<Project> => {

    const response = await fetch(`${API_URL}/projects/${projectId}`, {

        method: 'PATCH',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    });

    const data = await response.json();

    if(!response.ok) {throw new Error(data.error || 'failed to updadte the project')};
    return data;
};


export const deleteProject = async (projectId: number): Promise<Project> => { // since my dao returns the full object of deleted project i use type project here
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    const data = await response.json();

    if(!response.ok) {
        throw new Error(data.error || 'failed to delete the project');
    } return data
};

// ------------ tasks
export const getTasks = async (projectId: number): Promise<Task[]> => { // since we are returning many tasks i use [] arrays of tasks
    const response = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
        method: 'GET',
        credentials: 'include'
    });

    const data = await response.json();

    if(!response.ok) {
        throw new Error(data.error || 'could not get the tasks')
    } return data
};

export const createTask = async (projectId: number, body: {

    title: string;
    description: string;
    priority?: string;
    status?: string;
    due_date?: string;
}): Promise<Task> => {
    const response = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    });

    const data = await response.json();

    if(!response.ok) {
        throw new Error(data.error || 'failed to create the task')
    } return data;
}

export const updateTask = async (projectId: number, taskId: number, body: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    due_date?: string;
}): Promise<Task> => {
    const response = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    }); 
    const data = await response.json();

    if(!response.ok) {throw new Error(data.error || 'failed to update the task')}
    return data;
}

export const deleteTask = async (projectId: number, taskId: number): Promise<Task> => {
    const response = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    const data = await response.json();
    if(!response.ok) {
        throw new Error(data.error || 'failed to delete the task');}
            return data;
    };

// dashboard

export const getDashboardData = async (): Promise<ActivityLog[]> => {
    const response = await fetch(`${API_URL}/dashboard`, {
        method: 'GET',
        credentials: 'include'
    });
    const data = await response.json();
    if(!response.ok) {
        throw new Error(data.error || 'failed to get dashboard data');
    }
    return data;    
};