import React, { useRef, useEffect, useState } from 'react';

const Canvas = ({ color, lineWidth, tool, undo }) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [history, setHistory] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);

    useEffect(() => {
        const canvas = canvasRef.current;

        // Initialize the canvas once and set the context
        canvas.width = window.innerWidth * 2;
        canvas.height = window.innerHeight * 2;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        contextRef.current = canvas.getContext("2d");
        contextRef.current.scale(2, 2);
        contextRef.current.lineCap = "round";

    }, []);

    useEffect(() => {
        // Update the line width without resizing the canvas
        if (contextRef.current) {
            contextRef.current.lineWidth = lineWidth;
        }
    }, [lineWidth]);

    useEffect(() => {
        if (undo) {
            undoAction();
        }
    }, [undo]);

    const saveHistory = () => {
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL();
        setHistory(prev => [...prev.slice(0, currentIndex + 1), dataURL]);
        setCurrentIndex(prev => prev + 1);
    };

    const undoAction = () => {
        if (currentIndex <= 0) return;
        const previousState = history[currentIndex - 1];
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const img = new Image();
        img.src = previousState;
        img.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
            setCurrentIndex(prev => prev - 1);
        };
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
        if (tool === 'paintBucket') {
            fillArea(x, y);
            return;
        }
        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);
        setIsDrawing(true);
        saveHistory(); // Save history when starting a new drawing
    };

    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing || tool === 'paintBucket') {
            return;
        }

        const { x, y } = getMousePos(nativeEvent);
        if (tool === 'brush') {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineTo(x, y);
            contextRef.current.stroke();
        } else if (tool === 'eraser') {
            contextRef.current.strokeStyle = 'white'; // Eraser color
            contextRef.current.lineTo(x, y);
            contextRef.current.stroke();
        } else if (tool === 'spray') {
            spray(x, y);
        }
    };

    const spray = (x, y) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const radius = lineWidth * 2; // Make radius proportional to lineWidth
        const density = 100;
        const dotSize = Math.max(1, lineWidth / 10); // Make dot size proportional to lineWidth

        for (let i = 0; i < density; i++) {
            const offsetX = Math.random() * radius * 2 - radius;
            const offsetY = Math.random() * radius * 2 - radius;
            const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

            if (distance <= radius) {
                context.fillStyle = color;
                context.beginPath();
                context.arc(x + offsetX, y + offsetY, dotSize, 0, Math.PI * 2); // Use dotSize here
                context.fill();
            }
        }
    };

    const fillArea = (x, y) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        const colorToFill = hexToRgb(color);
        const startColor = getPixelColor(x, y);

        const queue = [[x, y]];
        const visited = new Set();
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

        while (queue.length) {
            const [cx, cy] = queue.shift();
            if (visited.has(`${cx},${cy}`)) continue;
            visited.add(`${cx},${cy}`);

            const currentColor = getPixelColor(cx, cy);
            if (!colorsMatch(currentColor, startColor)) continue;

            setPixelColor(cx, cy, colorToFill);
            directions.forEach(([dx, dy]) => {
                const nx = cx + dx;
                const ny = cy + dy;
                if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                    queue.push([nx, ny]);
                }
            });
        }

        context.putImageData(imgData, 0, 0);
    };

    const getPixelColor = (x, y) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const pixel = context.getImageData(x, y, 1, 1).data;
        return `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
    };

    const setPixelColor = (x, y, color) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const imgData = context.getImageData(x, y, 1, 1);
        const [r, g, b] = color;
        imgData.data[0] = r;
        imgData.data[1] = g;
        imgData.data[2] = b;
        imgData.data[3] = 255;
        context.putImageData(imgData, x, y);
    };

    const colorsMatch = (color1, color2) => {
        return color1 === color2;
    };

    const hexToRgb = (hex) => {
        hex = hex.replace(/^#/, '');
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        return [r, g, b];
    };

    return (
        <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
        />
    );
};

export default Canvas;
