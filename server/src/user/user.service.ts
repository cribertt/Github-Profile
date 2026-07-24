import {
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import axios from 'axios';

export interface GithubRepo {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  isFork: boolean;
  isArchived: boolean;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
}

export interface GithubProfile {
  // Identidad
  id: number;
  username: string;
  name: string | null;
  type: string;
  isSiteAdmin: boolean;

  // Info personal
  bio: string | null;
  avatarUrl: string;
  gravatarId: string | null;
  company: string | null;
  location: string | null;
  email: string | null;
  blog: string | null;
  twitterUsername: string | null;
  hireable: boolean | null;

  // Estadísticas
  publicRepos: number;
  publicGists: number;
  followers: number;
  following: number;

  // URLs útiles
  profileUrl: string;
  reposUrl: string;
  followersUrl: string;
  followingUrl: string;
  gistsUrl: string;
  organizationsUrl: string;

  // Fechas
  createdAt: string;
  updatedAt: string;

  // Repos destacados (ordenados por estrellas)
  topRepos: GithubRepo[];
}

@Injectable()
export class UserService {
  private readonly githubApiUrl = process.env.GITHUB_URL_API;

  private get headers() {
    return {
      Accept: 'application/vnd.github+json',
    };
  }

  async getUserProfile(username: string): Promise<GithubProfile> {
    try {
      const [userRes, reposRes] = await Promise.all([
        axios.get(`${this.githubApiUrl}/users/${username}`, {
          headers: this.headers,
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
          }),
        axios.get(
          `${this.githubApiUrl}/users/${username}/repos`,
          {
            headers: this.headers,
            params: { per_page: 100, sort: 'updated' },
          },
        ),
      ]);

      const data = userRes.data;

      const topRepos: GithubRepo[] = reposRes.data
        .filter((r: any) => !r.private)
        .sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6)
        .map((r: any) => ({
          name: r.name,
          description: r.description,
          url: r.html_url,
          language: r.language,
          stars: r.stargazers_count,
          forks: r.forks_count,
          watchers: r.watchers_count,
          openIssues: r.open_issues_count,
          isFork: r.fork,
          isArchived: r.archived,
          topics: r.topics || [],
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          pushedAt: r.pushed_at,
        }));

      return {
        id: data.id,
        username: data.login,
        name: data.name,
        type: data.type,
        isSiteAdmin: data.site_admin,

        bio: data.bio,
        avatarUrl: data.avatar_url,
        gravatarId: data.gravatar_id || null,
        company: data.company,
        location: data.location,
        email: data.email,
        blog: data.blog,
        twitterUsername: data.twitter_username,
        hireable: data.hireable,

        publicRepos: data.public_repos,
        publicGists: data.public_gists,
        followers: data.followers,
        following: data.following,

        profileUrl: data.html_url,
        reposUrl: data.repos_url,
        followersUrl: data.followers_url,
        followingUrl: data.following_url,
        gistsUrl: data.gists_url,
        organizationsUrl: data.organizations_url,

        createdAt: data.created_at,
        updatedAt: data.updated_at,

        topRepos,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new HttpException(
          `Usuario de GitHub "${username}" no encontrado`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.response?.status === 403) {
        const resetHeader = error.response.headers?.['x-ratelimit-reset'];
        const resetDate = resetHeader
          ? new Date(Number(resetHeader) * 1000).toLocaleTimeString('es-CL')
          : 'desconocido';
        throw new HttpException(
          `Se alcanzó el límite de peticiones a la API de GitHub. Se resetea a las ${resetDate}. Configurá GITHUB_TOKEN para subir el límite a 5000/hora.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new HttpException(
        'Error consultando la API de GitHub',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
