import React, { useState, useEffect } from "react";

const AlphaBanner: React.FC = () => {

    const [isVisible, setIsVisible] = useState<boolean>(false);

    useEffect(() => {
        // Check local storage to see if the banner has already been dismissed
        const dismissed = localStorage.getItem("alphaBannerDismissed");
        if (dismissed === "true") {
            setIsVisible(false);
        }
        else {
            setIsVisible(true)
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem("alphaBannerDismissed", "true");
    };

    if (!isVisible) return null;

    return (
        <div style={styles.banner}>
            <p style={styles.text}>
                This page is in <strong>alpha development</strong>. It will not work on mobile. Please do not expect
                a final product. We welcome your feedback. Email me at{" "}
                <a href="mailto:ExpanseInvestments@gmail.com" style={styles.link}>
                    ExpanseInvestments@gmail.com
                </a>
            </p>
            <button onClick={handleClose} style={styles.closeButton}>
                ✕
            </button>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    banner: {
        position: "fixed",
        top: 0,
        width: "100%",
        backgroundColor: "#f8d7da",
        color: "#721c24",
        border: "1px solid #f5c6cb",
        padding: "10px 20px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    text: {
        margin: 0,
        fontSize: "16px",
        lineHeight: "1.5",
    },
    link: {
        color: "#721c24",
        textDecoration: "underline",
    },
    closeButton: {
        background: "none",
        border: "none",
        color: "#721c24",
        fontSize: "20px",
        cursor: "pointer",
    },
};

export default AlphaBanner;
