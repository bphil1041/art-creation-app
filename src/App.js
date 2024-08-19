import React, { useState } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import './App.css';

const App = () => {
  const [color, setColor] = useState('black');
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState('brush');
  const [undo, setUndo] = useState(false);

  const handleUndo = () => {
    setUndo(true);
    setTimeout(() => setUndo(false), 0); // Reset undo to allow further undos
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
        onUndo={handleUndo}
      />
      <Canvas
        color={color}
        lineWidth={lineWidth}
        tool={tool}
        undo={undo}
      />
    </div>
  );
}

export default App;
