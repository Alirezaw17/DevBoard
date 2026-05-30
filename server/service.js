// projectService.js

const dao = require('./dao.js');

const getProjectById = async (projectId, userId) => {
  const project = await dao.getProjectById(projectId);

  if (!project) throw new Error('Project not found');
  if (project.user_id !== userId) throw new Error('Unauthorized');

  return project;
};

module.exports = {getProjectById};