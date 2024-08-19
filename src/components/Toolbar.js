import React, { useState } from 'react';

const Toolbar = ({ color, setColor, lineWidth, setLineWidth, tool, setTool, onUndo }) => {
    const tools = ['brush', 'eraser', 'spray', 'paint-bucket'];
    const [isOpen, setIsOpen] = useState(false);

    const toggleToolbar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="toolbar-container">
            <div className="hamburger" onClick={toggleToolbar}>
                ☰
            </div>
            <div className={`toolbar ${isOpen ? 'open' : ''}`}>
                {tools.map(t => (
                    <button
                        key={t}
                        onClick={() => setTool(t)}
                        style={{ backgroundColor: tool === t ? 'lightblue' : 'white' }}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(e.target.value)}
                />
                <button onClick={onUndo}>Undo</button>
            </div>
        </div>
    );
}

export default Toolbar;
