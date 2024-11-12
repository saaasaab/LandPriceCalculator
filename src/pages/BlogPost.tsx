
import './LandCalculator.scss';
import ContactMe from '../components/ContactMe';


const BlogPost = () => {

    return (
        <div className="land-calculator">
            <header className="app-header">
                BLOG POST
            </header>
            {/* <MonteCarloSimulator {...inputs} /> */}
           


            {/* <button
                onClick={() => copyToClipboard(params, setCopied)}
                className={`copy-url-button ${copied ? 'copied' : ''}`}
            >
                {copied ? 'Copied your work! Now share the link' : 'Share your work'}
            </button> */}
            <ContactMe />

        </div >
    );
};

export default BlogPost;
