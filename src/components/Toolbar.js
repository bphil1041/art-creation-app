import React from 'react';

const Toolbar = ({ color, setColor, lineWidth, setLineWidth, tool, setTool, handleUndo }) => {
    const tools = ['brush', 'eraser', 'spray', 'paintBucket'];

    return (
        <div className="toolbar">
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
            <button
                onClick={handleUndo} // Call handleUndo on click
                style={{ backgroundColor: 'lightblue' }}
            >
                Undo
            </button>
        </div>
    );
}

export default Toolbar;
