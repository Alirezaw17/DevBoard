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

export interface Projectt {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  user_id: number;
  created_at: string;
}

export interface Taskk {
  id: number;
  project_id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
  created_at: string;
}

export interface ActivityLog {
    id: number;
    user_id: number;    
    action: string;
    entity_type: string;
    entity_name: string;
    project_name: string;
    created_at: string;
};

export interface Activity {
  id: number;
  userId: number;
  action: string;
  title: string;
  type: string;
  time: string;
};