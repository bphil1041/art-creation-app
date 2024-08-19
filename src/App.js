import React, { useState } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import './App.css';

const App = () => {
  const [color, setColor] = useState('black');
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState('brush');
  const [undo, setUndo] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const handleUndo = () => {
    setUndo(true);
    setTimeout(() => setUndo(false), 0); // Reset undo flag after processing
  };

  const saveHistory = () => {
    const canvas = document.querySelector('canvas');
    const dataURL = canvas.toDataURL();
    setHistory(prev => [...prev.slice(0, currentIndex + 1), dataURL]);
    setCurrentIndex(prev => prev + 1);
  };

  const undoAction = () => {
    if (currentIndex <= 0) return;
    const previousState = history[currentIndex - 1];
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
      setCurrentIndex(prev => prev - 1);
    };
  };

  return (
    <div className="App">
      <Toolbar
        color={color}
        setColor={setColor}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
        tool={tool}
        setTool={setTool}
        undo={handleUndo}
      />
      <Canvas
        color={color}
        lineWidth={lineWidth}
        tool={tool}
        undo={undo}
        saveHistory={saveHistory}
      />
    </div>
  );
};

export default App;
