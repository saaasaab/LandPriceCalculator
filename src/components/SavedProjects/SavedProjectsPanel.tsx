import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSavedProjects } from '../../hooks/useSavedProjects';
import { applyPageInputs, collectPageInputs, formatProjectDate } from '../../utils/projectStorage';
import { EPageNames } from '../../utils/types';
import { routes } from '../Navbar';
import SaveProjectDialog, { SaveProjectMode } from './SaveProjectDialog';
import './SavedProjectsPanel.scss';

type SavedProjectsPanelProps = {
  page: EPageNames;
  onProjectLoad: () => void;
};

const SavedProjectsPanel = ({ page, onProjectLoad }: SavedProjectsPanelProps) => {
  const { user } = useAuth();
  const { projects, isLoading, error, saveProject, updateProject, deleteProject, loadProject } =
    useSavedProjects(page, !!user);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const activeProject = activeProjectId
    ? projects.find((project) => project.id === activeProjectId) ?? null
    : null;

  const handleSave = async (title: string, mode: SaveProjectMode) => {
    const inputs = collectPageInputs(page);

    if (mode === 'update' && activeProjectId) {
      await updateProject(activeProjectId, { title, inputs });
      return;
    }

    const project = await saveProject(title, inputs);
    setActiveProjectId(project.id);
  };

  const handleLoad = async (projectId: string) => {
    setLoadingProjectId(projectId);
    setLoadError(null);

    try {
      const project = await loadProject(projectId);
      applyPageInputs(page, project.inputs);
      setActiveProjectId(projectId);
      onProjectLoad();
    } catch {
      setLoadError('Could not load project. Please try again.');
    } finally {
      setLoadingProjectId(null);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Delete this saved project?')) return;

    setDeletingId(projectId);
    try {
      await deleteProject(projectId);
      if (activeProjectId === projectId) {
        setActiveProjectId(null);
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside className="saved-projects-panel">
      <div className="header">
        <div className="title-row">
          <FolderOpen size={18} aria-hidden />
          <h2>Saved Projects</h2>
        </div>

        {user ? (
          <button
            type="button"
            className="save-btn"
            onClick={() => setIsDialogOpen(true)}
          >
            <Save size={16} aria-hidden />
            <span>Save</span>
          </button>
        ) : null}
      </div>

      {!user ? (
        <div className="empty">
          <p>Log in to save and load your project history.</p>
          <Link to={routes.LOGIN}>Log in</Link>
        </div>
      ) : isLoading ? (
        <p className="status">Loading projects...</p>
      ) : error ? (
        <p className="status error">{error}</p>
      ) : projects.length === 0 ? (
        <div className="empty">
          <p>No saved projects yet.</p>
          <p>Save your current inputs to build a history for this calculator.</p>
        </div>
      ) : (
        <>
          {loadError ? <p className="status error">{loadError}</p> : null}
          <ul className="list">
          {projects.map((project) => (
            <li
              key={project.id}
              className={`item ${activeProjectId === project.id ? 'active' : ''}`}
            >
              <button
                type="button"
                className="load-btn"
                onClick={() => handleLoad(project.id)}
                disabled={loadingProjectId === project.id}
              >
                <span className="title">
                  {loadingProjectId === project.id ? 'Loading...' : project.title}
                </span>
                <span className="date">
                  {formatProjectDate(project.updatedAt)}
                </span>
              </button>

              <button
                type="button"
                className="delete-btn"
                onClick={() => handleDelete(project.id)}
                disabled={deletingId === project.id}
                aria-label={`Delete ${project.title}`}
              >
                <Trash2 size={15} aria-hidden />
              </button>
            </li>
          ))}
          </ul>
        </>
      )}

      <SaveProjectDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        activeProject={activeProject}
        onSave={handleSave}
      />
    </aside>
  );
};

export default SavedProjectsPanel;
