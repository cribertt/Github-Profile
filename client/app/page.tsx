import Image from 'next/image';

interface GithubRepo {
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

interface GithubProfile {
  id: number;
  username: string;
  name: string | null;
  type: string;
  isSiteAdmin: boolean;
  bio: string | null;
  avatarUrl: string;
  gravatarId: string | null;
  company: string | null;
  location: string | null;
  email: string | null;
  blog: string | null;
  twitterUsername: string | null;
  hireable: boolean | null;
  publicRepos: number;
  publicGists: number;
  followers: number;
  following: number;
  profileUrl: string;
  reposUrl: string;
  followersUrl: string;
  followingUrl: string;
  gistsUrl: string;
  organizationsUrl: string;
  createdAt: string;
  updatedAt: string;
  topRepos: GithubRepo[];
}

async function getProfile(): Promise<GithubProfile | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ;
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;

  try {
    const res = await fetch(`${apiUrl}/user/${username}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function Home() {
  const profile = await getProfile();

  if (!profile) {
    return (
      <div className="container">
        <div className="card">
          <p className="error">
            No se pudo cargar el perfil. Verificá que el backend de NestJS
            esté corriendo en el puerto correcto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card main-card">
        <Image
          src={profile.avatarUrl}
          alt={profile.username}
          width={120}
          height={120}
          className="avatar"
        />
        <h1 className="name">{profile.name || profile.username}</h1>
        <p className="username">
          @{profile.username}
          {profile.hireable && <span className="badge">Disponible para trabajar</span>}
        </p>
        {profile.bio && <p className="bio">{profile.bio}</p>}

        <div className="stats">
          <div>
            <span className="stat-value">{profile.publicRepos}</span>
            <span className="stat-label">Repositorios</span>
          </div>
          <div>
            <span className="stat-value">{profile.followers}</span>
            <span className="stat-label">Seguidores</span>
          </div>
          <div>
            <span className="stat-value">{profile.following}</span>
            <span className="stat-label">Siguiendo</span>
          </div>
          <div>
            <span className="stat-value">{profile.publicGists}</span>
            <span className="stat-label">Gists</span>
          </div>
        </div>

        <div className="meta">
          {profile.company && <p>🏢 {profile.company}</p>}
          {profile.location && <p>📍 {profile.location}</p>}
          {profile.email && <p>✉️ {profile.email}</p>}
          {profile.blog && (
            <p>
              🔗{' '}
              <a className="link" href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`} target="_blank">
                {profile.blog}
              </a>
            </p>
          )}
          {profile.twitterUsername && <p>@{profile.twitterUsername}</p>}
          <p>Tipo de cuenta: {profile.type}{profile.isSiteAdmin ? ' (admin de GitHub)' : ''}</p>
          <p>Se unió el {fmtDate(profile.createdAt)}</p>
          <p>Última actualización de perfil: {fmtDate(profile.updatedAt)}</p>
          <p>ID interno de GitHub: {profile.id}</p>
          <p>
            <a className="link" href={profile.profileUrl} target="_blank">
              Ver perfil completo en GitHub →
            </a>
          </p>
        </div>
      </div>

      {profile.topRepos.length > 0 && (
        <div className="card repos-card">
          <h2 className="section-title">Repositorios destacados</h2>
          <div className="repos-grid">
            {profile.topRepos.map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                className="repo"
              >
                <div className="repo-header">
                  <span className="repo-name">{repo.name}</span>
                  {repo.isFork && <span className="tag">fork</span>}
                  {repo.isArchived && <span className="tag">archivado</span>}
                </div>
                {repo.description && (
                  <p className="repo-desc">{repo.description}</p>
                )}
                {repo.topics.length > 0 && (
                  <div className="topics">
                    {repo.topics.slice(0, 4).map((t) => (
                      <span key={t} className="topic">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="repo-stats">
                  {repo.language && <span>{repo.language}</span>}
                  <span>{repo.stars}</span>
                  <span>{repo.forks}</span>
                  <span>{repo.watchers}</span>
                  <span>{repo.openIssues}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
