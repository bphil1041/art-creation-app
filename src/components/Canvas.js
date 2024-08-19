import React, { useRef, useEffect, useState } from 'react';

const Canvas = ({ color, lineWidth, tool, undo }) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth * 2;
        canvas.height = window.innerHeight * 2;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        const context = canvas.getContext("2d");
        context.scale(2, 2);
        context.lineCap = "round";
        contextRef.current = context;

        // Initialize canvas history with an empty state
        saveHistory();
    }, []);

    const saveHistory = () => {
        const canvas = canvasRef.current;
        const newHistory = [...history.slice(0, historyIndex + 1), canvas.toDataURL()];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const getMousePos = (event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width / 2,
            y: (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height / 2
        };
    };

    const startDrawing = ({ nativeEvent }) => {
        const { x, y } = getMousePos(nativeEvent);
        if (tool === 'paint-bucket') {
            contextRef.current.fillStyle = color;
            contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            saveHistory(); // Save history after bucket fill
        } else {
            contextRef.current.beginPath();
            contextRef.current.moveTo(x, y);
            setIsDrawing(true);
        }
    };

    const finishDrawing = () => {
        if (isDrawing) {
            contextRef.current.closePath();
            setIsDrawing(false);
            saveHistory(); // Save history after drawing
        }
    };

    const drawSpray = ({ nativeEvent }) => {
        const { x, y } = getMousePos(nativeEvent);
        const sprayDensity = 20;

        for (let i = 0; i < sprayDensity; i++) {
            const offsetX = (Math.random() - 0.5) * lineWidth * 2;
            const offsetY = (Math.random() - 0.5) * lineWidth * 2;
            contextRef.current.fillStyle = color;
            contextRef.current.fillRect(x + offsetX, y + offsetY, 1, 1);
        }
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing || tool === 'paint-bucket') {
            return;
        }
        const { x, y } = getMousePos(nativeEvent);

        contextRef.current.strokeStyle = color;
        contextRef.current.lineWidth = lineWidth;

        if (tool === 'brush') {
            contextRef.current.lineTo(x, y);
            contextRef.current.stroke();
        } else if (tool === 'eraser') {
            contextRef.current.strokeStyle = 'white';
            contextRef.current.lineTo(x, y);
            contextRef.current.stroke();
        } else if (tool === 'spray') {
            drawSpray({ nativeEvent });
        }
    };

    const undoLastAction = () => {
        if (historyIndex <= 0) return;

        const canvas = canvasRef.current;
        const previousState = history[historyIndex - 1];
        const img = new Image();
        img.src = previousState;

        img.onload = () => {
            contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
            contextRef.current.drawImage(img, 0, 0);
            setHistoryIndex(historyIndex - 1);
        };
    };

    useEffect(() => {
        if (undo) {
            undoLastAction();
        }
    }, [undo]);

    return (
        <canvas
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            ref={canvasRef}
        />
    );
};

export default Canvas;
