import "./PageKeyTakeaways.scss";

interface PageKeyTakeawaysProps {
  takeaways: string[];
}

const PageKeyTakeaways = ({ takeaways }: PageKeyTakeawaysProps) => {
  if (!takeaways.length) return null;

  return (
    <section className="page-takeaways" aria-labelledby="page-takeaways-heading">
      <h2 id="page-takeaways-heading">Key Takeaways</h2>
      <ul>
        {takeaways.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
};

export default PageKeyTakeaways;
