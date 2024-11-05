import './Hamburger.scss';

const Hamburger = ({isOpen, onClick}:{isOpen:boolean, onClick: () => void}) => {
  return (
      <div className={`hamburger ${isOpen ? 'is-open' : ''}`} onClick={onClick}>
        <div className="burger burger1" />
        <div className="burger burger2" />
        <div className="burger burger3" />
      </div>
  );
};

export default Hamburger;
