import { useEffect, useState } from 'react';
import { getDashboardData, getProjects, getUserById } from '../api';
import type { User, Project, ActivityLog } from '../types';



 function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [userData, activityData, projectsData] = await Promise.all([
          getUserById(),
          getDashboardData(),
          getProjects()
        ]);

        setUser(userData);
        setActivity(activityData);
        setProjects(projectsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1>Welcome back, {user?.display_name}</h1>
      <p>Here is your recent activity and your projects.</p>

      <section>
        <h2>Recent Activity</h2>
        {activity.length === 0 ? (
          <p>No recent activity yet.</p>
        ) : (
          activity.map((log) => (
            <div key={log.id}>
              <p>
                {log.action} — {log.entity_name}
                {log.project_name ? ` — ${log.project_name}` : ''}
              </p>
              <small>{new Date(log.created_at).toLocaleString()}</small>
            </div>
          ))
        )}
      </section>

      <section>
        <h2>Your Projects</h2>
        {projects.length === 0 ? (
          <div>
            <p>No projects yet.</p>
            <p>Create your first project to start organizing your work.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: project.color,
                  display: 'inline-block',
                  marginRight: '8px'
                }}
              />
              <strong>{project.name}</strong>
              <p>{project.description}</p>
              <p>{project.status}</p>
              <a href={`/projects/${project.id}`}>Open Project</a>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default Dashboard;