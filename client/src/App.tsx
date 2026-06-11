import { Routes, Route, Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';
import Task from './pages/Task';
import AllTasks from './pages/AllTasks';
import AllProjects from './pages/AllProjects';
import { getProjects, getTasks } from "./api";
import { useEffect, useState } from "react";
import type { Projectt, Taskk } from "./types";






function App() {

const [projects, setProjects] = useState<Projectt[]>([]) //

useEffect(() => {
  getProjects()
  .then((pjs) => {
    setProjects(pjs)
  
  })
}, []);

  
  return (
   <Routes>
    <Route path="/login" element={<Login />}/>
    <Route path="/register" element={<Register />}/>
    
    <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard projects={projects} />} />
        <Route path="/project" element={<AllProjects />} />
        <Route path="/projects/:id" element={<Project/>} />
        <Route path="/projects/:pId/tasks" element={<AllTasks />} />
        <Route path="/projects/:pId/tasks/:tId" element={<Task />} />
    </Route>

    <Route path="*" element={<Navigate to="/login" />} />

   </Routes>
  )
}

export default App;