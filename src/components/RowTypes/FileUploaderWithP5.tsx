import React, { useState } from "react";
import p5 from "p5";

const FileUploaderWithP5: React.FC = () => {
  const [imageURL, setImageURL] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageURL(url);
    }
  };

  // P5 Sketch function
  const sketch = (p: p5) => {
    let img: p5.Image | null = null;

    p.preload = () => {
      if (imageURL) {
        img = p.loadImage(imageURL);
      }
    };

    p.setup = () => {
      p.createCanvas(800, 600); // Set canvas size
    };

    p.draw = () => {
      if (img) {
        p.image(img, 0, 0, p.width, p.height); // Draw image as background
      } else {
        p.background(200); // Default background
      }
    };
  };

  // Mount or update P5 instance
  React.useEffect(() => {
    const p5Instance = new p5(sketch);

    return () => {
      p5Instance.remove();
    };
  }, [imageURL]); // Re-run the sketch when imageURL changes

  return (
    <div>
      <h1>Upload a File to Display as Background</h1>
      <input type="file" accept="image/*" onChange={handleFileUpload} />
      <div id="p5-container" />
    </div>
  );
};

export default FileUploaderWithP5;
