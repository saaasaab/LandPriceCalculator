import React from "react";
import { InfoIcon } from 'lucide-react'; //Box,
import './HelpLink.scss'

interface QuestionMarkProps {
    helpLink: string; // URL to the help page
    tooltipText?: string; // Optional tooltip text
}

const QuestionMark: React.FC<QuestionMarkProps> = ({ helpLink, tooltipText }) => {
    const openHelpPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        window.open(helpLink, "_blank", "noopener,noreferrer");
    };

    return (

        <span className="question-mark">
            <a
                href={helpLink}
                onClick={openHelpPage}
                title={tooltipText || "Learn more"}
                aria-label="Help link"
            >

                <InfoIcon
                    xmlns="http://www.w3.org/2000/svg"
                    // fill="currentColor"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    className="question-mark-icon"
                />

            </a>
        </span>

    );
};

export default QuestionMark;