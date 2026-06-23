import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './SaveProjectDialog.scss';

export type SaveProjectMode = 'update' | 'new';

type SaveProjectDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  activeProject?: { id: string; title: string } | null;
  onSave: (title: string, mode: SaveProjectMode) => Promise<void>;
};

const SaveProjectDialog = ({ isOpen, onClose, activeProject, onSave }: SaveProjectDialogProps) => {
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(activeProject?.title ?? '');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen, activeProject]);

  if (!isOpen) return null;

  const handleSave = async (mode: SaveProjectMode) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Enter a project title.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(trimmedTitle, mode);
      onClose();
    } catch {
      setError('Could not save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSave(activeProject ? 'update' : 'new');
  };

  return createPortal(
    <div className="save-project-dialog">
      <div className="overlay" onClick={onClose}>
        <div
          className="dialog"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-labelledby="save-project-title"
          aria-modal="true"
        >
          <h3 id="save-project-title">
            {activeProject ? 'Save Project' : 'Save New Project'}
          </h3>
          <p>
            {activeProject
              ? 'Update the open project or save your changes as a new project.'
              : 'Give this analysis a name so you can find it later.'}
          </p>

          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Project title"
              maxLength={120}
              disabled={isSaving}
            />

            {error ? <p className="error">{error}</p> : null}

            <div className="actions">
              <button type="button" className="cancel" onClick={onClose} disabled={isSaving}>
                Cancel
              </button>

              {activeProject ? (
                <button
                  type="button"
                  className="save-as-new"
                  onClick={() => handleSave('new')}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save as new'}
                </button>
              ) : null}

              <button type="submit" className="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SaveProjectDialog;
