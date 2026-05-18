// src/types.ts

// interface  means an object must look like this:

export interface User {
  id: number;
  email: string;
  display_name: string;
  role: 'admin' | 'member';
}

/*const user: User = {
  id: 1,
  email: "test@example.com",
  display_name: "Ali"
};
*/

export interface Project {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  user_id: number;
  created_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
  created_at: string;
}