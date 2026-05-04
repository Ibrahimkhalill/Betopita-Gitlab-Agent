import axios from 'axios';
import { getConfig } from '../db.js';

export interface GitLabProject {
  id: number;
  name: string;
  path_with_namespace: string;
  web_url: string;
  description: string;
}

export async function fetchProjects(): Promise<GitLabProject[]> {
  const url = getConfig('GITLAB_URL') || process.env.GITLAB_URL || 'https://gitlab.com';
  const token = getConfig('GITLAB_TOKEN') || process.env.GITLAB_TOKEN;
  const groupId = getConfig('GITLAB_GROUP') || process.env.GITLAB_GROUP;

  if (!token) {
    throw new Error('GitLab token is missing');
  }

  const endpoint = groupId 
    ? `${url.replace(/\/$/, '')}/api/v4/groups/${groupId}/projects`
    : `${url.replace(/\/$/, '')}/api/v4/projects?membership=true`;

  const response = await axios.get(endpoint, {
    headers: { 'PRIVATE-TOKEN': token },
    params: {
      per_page: 100,
      simple: true,
      include_subgroups: true
    }
  });

  return response.data;
}

export async function fetchFileContent(projectId: number, filePath: string): Promise<string> {
  const url = getConfig('GITLAB_URL') || process.env.GITLAB_URL || 'https://gitlab.com';
  const token = getConfig('GITLAB_TOKEN') || process.env.GITLAB_TOKEN;

  try {
    const response = await axios.get(
      `${url.replace(/\/$/, '')}/api/v4/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}/raw`,
      {
        headers: { 'PRIVATE-TOKEN': token },
        params: { ref: 'main' } // or 'master'
      }
    );
    return response.data;
  } catch (e) {
    return ""; // File not found or other error
  }
}

export async function fetchProjectTree(projectId: number): Promise<any[]> {
  const url = getConfig('GITLAB_URL') || process.env.GITLAB_URL || 'https://gitlab.com';
  const token = getConfig('GITLAB_TOKEN') || process.env.GITLAB_TOKEN;

  const response = await axios.get(
    `${url.replace(/\/$/, '')}/api/v4/projects/${projectId}/repository/tree`,
    {
      headers: { 'PRIVATE-TOKEN': token },
      params: { recursive: true, per_page: 100 }
    }
  );
  return response.data;
}
