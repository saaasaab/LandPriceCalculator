import ImageUploader from '../../pages/SiteplanDesigner/ImageUploader';

type TopoUploadPanelProps = {
  onFileUpload: (url: string) => void;
};

const TopoUploadPanel = ({ onFileUpload }: TopoUploadPanelProps) => (
  <section className="topo-workflow-panel">
    <h2>Property image</h2>
    <ImageUploader onFileUpload={onFileUpload} />
  </section>
);

export default TopoUploadPanel;
