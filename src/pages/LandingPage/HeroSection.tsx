import React from "react";
// import p5 from "p5";
import './HeroSection.scss';
import { Link } from "react-router-dom";
import { routes } from "../../components/Navbar";

export const heroCanvasHeight = 500;
const HeroSection: React.FC = () => {
    // const canvasRef = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     const sketch = (p: p5) => {
    //         const hexSize = 30;
    //         const cols = Math.ceil(window.innerWidth / hexSize);
    //         const rows = Math.ceil(heroCanvasHeight / (hexSize * Math.sqrt(3)));
    //         p.setup = () => {
    //             p.createCanvas(window.innerWidth, heroCanvasHeight).parent(canvasRef.current!);
    //             p.frameRate(24);
    //         };

    //         p.draw = () => {
    //             p.background(20);
    //             drawHexGrid();
    //         };

    //         const drawHexGrid = () => {
    //             for (let row = 0; row < rows; row++) {
    //                 for (let col = 0; col < cols; col++) {
    //                     const x = col * hexSize * 1.5;
    //                     const y = row * hexSize * Math.sqrt(3) + (col % 2 === 0 ? 0 : (hexSize * Math.sqrt(3)) / 2);
    //                     drawHexagon(x, y);
    //                 }
    //             }
    //         };

    //         const drawHexagon = (x: number, y: number) => {
    //             const distance = p.dist(p.mouseX, p.mouseY, x, y);
    //             const maxDistance = 150;
    //             const strokeAlpha = p.map(distance, 0, maxDistance, 255, 50, true);

    //             p.stroke(80, 80, 80, strokeAlpha + 50);
    //             const fillAlpha = p.map(distance, 0, maxDistance, 100, 10, true);
    //             p.fill(80, 80, 80, fillAlpha);
    //             p.beginShape();
    //             for (let i = 0; i < 6; i++) {
    //                 const angle = p.radians(i * 60);
    //                 const vx = x + hexSize * p.cos(angle);
    //                 const vy = y + hexSize * p.sin(angle);
    //                 p.vertex(vx, vy);
    //             }
    //             p.endShape(p.CLOSE);
    //         };
    //     };

    //     const p5Instance = new p5(sketch);
    //     return () => p5Instance.remove();
    // }, []);

    return (
        <header className="hero">
            {/* <div ref={canvasRef} className="hero-canvas" /> */}
            <div className="hero-content">
                <h1>Transform Your Real Estate Analysis</h1>
                <p className="tagline">Expert Real Estate Analysis Tools for Free</p>
               
                {/* <p className="tagline">A rich man's tool at a poor man's price</p> */}

                {/* <p className="subtitle">Professional-grade real estate calculators at your fingertips</p> */}
                <Link className="cta-button" to={routes.SIGN_UP}>Sign Up for Early Acces</Link>
            </div>
        </header>
    );
};

export default HeroSection;
