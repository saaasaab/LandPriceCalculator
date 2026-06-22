import { FaqItem } from "../utils/pageMeta";
import "./PageFaq.scss";

interface PageFaqProps {
  faqs: FaqItem[];
}

const PageFaq = ({ faqs }: PageFaqProps) => {
  if (!faqs.length) return null;

  return (
    <section className="page-faq" aria-labelledby="page-faq-heading">
      <h2 id="page-faq-heading">Common Questions</h2>
      <dl className="page-faq__list">
        {faqs.map((faq) => (
          <div key={faq.question} className="page-faq__item">
            <dt>
              <h3>{faq.question}</h3>
            </dt>
            <dd>{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default PageFaq;
