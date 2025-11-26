
import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';

// --- TYPES ---

export type AnnotationTool = 'select' | 'pan' | 'brush' | 'text' | 'eraser' | 'rect' | 'bar' | 'diamond' | 'circle' | 'arrow' | 'line';

export interface CanvasElement {
    id: string;
    type: AnnotationTool | 'image';
    x: number;
    y: number;
    width: number;
    height: number;
    stroke: string;
    fill: string;
    strokeWidth: number;
    radius: number;
    opacity: number;
    text?: string;
    points?: {x: number, y: number}[];
    svg?: string;
}

export interface AnnotationLayerHandle {
    capture: () => Promise<string | null>;
    undo: () => void;
    redo: () => void;
    clear: () => void;
    pasteImage: (url: string, x: number, y: number) => void;
    updateElement: (id: string, updates: Partial<CanvasElement>) => void;
    deleteSelected: () => void;
}

interface AnnotationLayerProps {
    tool: AnnotationTool;
    color: string;
    width: number;
    height: number;
    onSelect?: (element: CanvasElement | null) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const AnnotationLayer = forwardRef<AnnotationLayerHandle, AnnotationLayerProps>(({ tool, color, width, height, onSelect }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Core State (Refs for performance)
    const elementsRef = useRef<CanvasElement[]>([]);
    const historyRef = useRef<CanvasElement[][]>([]);
    const historyStepRef = useRef<number>(-1);
    
    // Interaction State
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const isDragging = useRef(false);
    const isDrawing = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 }); // Mouse pos at drag start
    const elStartPos = useRef({ x: 0, y: 0 }); // Element pos at drag start
    const currentEl = useRef<CanvasElement | null>(null);
    
    // Render Loop
    const requestRef = useRef<number>();

    // --- HISTORY HELPERS ---
    const pushHistory = () => {
        const newHistory = historyRef.current.slice(0, historyStepRef.current + 1);
        newHistory.push(JSON.parse(JSON.stringify(elementsRef.current))); // Deep copy
        historyRef.current = newHistory;
        historyStepRef.current = newHistory.length - 1;
    };

    // --- IMPERATIVE API ---
    useImperativeHandle(ref, () => ({
        capture: async () => {
            if (canvasRef.current) {
                const finalCanvas = document.createElement('canvas');
                finalCanvas.width = width;
                finalCanvas.height = height;
                const ctx = finalCanvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(canvasRef.current, 0, 0, width, height);
                    return finalCanvas.toDataURL('image/png').split(',')[1];
                }
            }
            return null;
        },
        undo: () => {
            if (historyStepRef.current > 0) {
                historyStepRef.current--;
                elementsRef.current = JSON.parse(JSON.stringify(historyRef.current[historyStepRef.current]));
                setSelectedId(null);
                if (onSelect) onSelect(null);
            } else if (historyStepRef.current === 0) {
                elementsRef.current = [];
                historyStepRef.current = -1;
                setSelectedId(null);
                if (onSelect) onSelect(null);
            }
        },
        redo: () => {
            if (historyStepRef.current < historyRef.current.length - 1) {
                historyStepRef.current++;
                elementsRef.current = JSON.parse(JSON.stringify(historyRef.current[historyStepRef.current]));
                setSelectedId(null);
                if (onSelect) onSelect(null);
            }
        },
        clear: () => {
            elementsRef.current = [];
            pushHistory();
            setSelectedId(null);
        },
        pasteImage: (src: string, x: number, y: number) => {
            fetch(src).then(r => r.text()).then(svgContent => {
                const newEl: CanvasElement = {
                    id: generateId(),
                    type: 'image',
                    x: x - 24, y: y - 24, width: 48, height: 48,
                    stroke: 'none', fill: 'none', strokeWidth: 0, radius: 0, opacity: 1,
                    svg: svgContent
                };
                elementsRef.current.push(newEl);
                pushHistory();
            });
        },
        updateElement: (id: string, updates: Partial<CanvasElement>) => {
            elementsRef.current = elementsRef.current.map(el => el.id === id ? { ...el, ...updates } : el);
            pushHistory();
        },
        deleteSelected: () => {
            if (selectedId) {
                elementsRef.current = elementsRef.current.filter(el => el.id !== selectedId);
                pushHistory();
                setSelectedId(null);
                if (onSelect) onSelect(null);
            }
        }
    }));

    // --- DRAWING LOGIC ---
    const drawElement = (ctx: CanvasRenderingContext2D, el: CanvasElement, isSelected: boolean) => {
        ctx.save();
        ctx.globalAlpha = el.opacity ?? 1;
        
        if (isSelected) {
            ctx.shadowColor = '#3b82f6';
            ctx.shadowBlur = 8;
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
        } else {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.strokeStyle = el.stroke;
            ctx.lineWidth = el.strokeWidth;
        }
        ctx.fillStyle = el.fill;

        if (el.type === 'brush' && el.points && el.points.length > 0) {
            ctx.beginPath();
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.moveTo(el.points[0].x, el.points[0].y);
            if (el.points.length < 3) {
                 el.points.forEach(p => ctx.lineTo(p.x, p.y));
            } else {
                 for (let i = 1; i < el.points.length - 2; i++) {
                     const c = (el.points[i].x + el.points[i + 1].x) / 2;
                     const d = (el.points[i].y + el.points[i + 1].y) / 2;
                     ctx.quadraticCurveTo(el.points[i].x, el.points[i].y, c, d);
                 }
                 ctx.lineTo(el.points[el.points.length - 1].x, el.points[el.points.length - 1].y);
            }
            ctx.stroke();
        } else if (el.type === 'rect' || el.type === 'bar') {
            ctx.beginPath();
            if (el.radius > 0) ctx.roundRect(el.x, el.y, el.width, el.height, el.radius);
            else ctx.rect(el.x, el.y, el.width, el.height);
            ctx.fill();
            if (el.strokeWidth > 0) ctx.stroke();
        } else if (el.type === 'circle') {
            ctx.beginPath();
            ctx.ellipse(
                el.x + el.width / 2, el.y + el.height / 2,
                Math.abs(el.width / 2), Math.abs(el.height / 2),
                0, 0, 2 * Math.PI
            );
            ctx.fill();
            if (el.strokeWidth > 0) ctx.stroke();
        } else if (el.type === 'diamond') {
            ctx.beginPath();
            ctx.moveTo(el.x + el.width/2, el.y);
            ctx.lineTo(el.x + el.width, el.y + el.height/2);
            ctx.lineTo(el.x + el.width/2, el.y + el.height);
            ctx.lineTo(el.x, el.y + el.height/2);
            ctx.closePath();
            ctx.fill();
            if (el.strokeWidth > 0) ctx.stroke();
        } else if (el.type === 'arrow') {
             ctx.beginPath();
             ctx.moveTo(el.x, el.y);
             ctx.lineTo(el.x + el.width, el.y + el.height);
             ctx.stroke();
             const angle = Math.atan2(el.height, el.width);
             const headLen = 10;
             ctx.beginPath();
             ctx.moveTo(el.x + el.width, el.y + el.height);
             ctx.lineTo(el.x + el.width - headLen * Math.cos(angle - Math.PI / 6), el.y + el.height - headLen * Math.sin(angle - Math.PI / 6));
             ctx.moveTo(el.x + el.width, el.y + el.height);
             ctx.lineTo(el.x + el.width - headLen * Math.cos(angle + Math.PI / 6), el.y + el.height - headLen * Math.sin(angle + Math.PI / 6));
             ctx.stroke();
        } else if (el.type === 'line') {
            ctx.beginPath();
            ctx.moveTo(el.x, el.y);
            ctx.lineTo(el.x + el.width, el.y + el.height); 
            ctx.stroke();
        } else if (el.type === 'text' && el.text) {
            ctx.fillStyle = el.fill;
            ctx.font = `${Math.max(12, el.height)}px Inter, sans-serif`;
            ctx.fillText(el.text, el.x, el.y + el.height); 
        } else if (el.type === 'image' && el.svg) {
            const img = new Image();
            img.src = el.svg.startsWith('<') ? 'data:image/svg+xml;base64,' + btoa(el.svg) : el.svg;
            ctx.drawImage(img, el.x, el.y, el.width, el.height);
        }
        ctx.restore();
    };

    // --- ANIMATION LOOP ---
    const render = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        // Draw saved elements
        elementsRef.current.forEach(el => {
            drawElement(ctx, el, el.id === selectedId);
        });

        // Draw current interaction
        if (currentEl.current) {
            drawElement(ctx, currentEl.current, true);
        }

        requestRef.current = requestAnimationFrame(render);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(render);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [width, height, selectedId]); // Re-bind if these change

    // --- HANDLERS ---
    const getCoords = (e: React.PointerEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        const { x, y } = getCoords(e);
        e.currentTarget.setPointerCapture(e.pointerId);

        if (tool === 'select') {
            const clicked = [...elementsRef.current].reverse().find(el => {
                if (el.type === 'brush') return false; 
                return x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height;
            });

            if (clicked) {
                setSelectedId(clicked.id);
                isDragging.current = true;
                dragStart.current = { x, y };
                elStartPos.current = { x: clicked.x, y: clicked.y };
                if (onSelect) onSelect(clicked);
            } else {
                setSelectedId(null);
                if (onSelect) onSelect(null);
            }
            return;
        }

        // START DRAWING
        isDrawing.current = true;
        dragStart.current = { x, y };

        if (tool === 'brush') {
            currentEl.current = {
                id: generateId(),
                type: 'brush',
                x: 0, y: 0, width: 0, height: 0,
                stroke: color, fill: 'none', strokeWidth: 3, radius: 0, opacity: 1,
                points: [{ x, y }]
            };
        } else if (tool === 'text') {
            const text = prompt("Enter text:", "");
            if (text) {
                const newEl: CanvasElement = {
                    id: generateId(),
                    type: 'text',
                    x, y, width: text.length * 8, height: 20,
                    stroke: color, fill: color, strokeWidth: 1, radius: 0, opacity: 1,
                    text
                };
                elementsRef.current.push(newEl);
                pushHistory();
            }
            isDrawing.current = false;
        } else {
            currentEl.current = {
                id: generateId(),
                type: tool,
                x, y, width: 0, height: 0,
                stroke: (tool === 'bar') ? 'none' : color,
                fill: (tool === 'bar') ? color : 'none',
                strokeWidth: tool === 'bar' ? 0 : 2,
                radius: tool === 'bar' ? 4 : 0,
                opacity: 1
            };
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const { x, y } = getCoords(e);

        if (tool === 'select' && isDragging.current && selectedId) {
            const dx = x - dragStart.current.x;
            const dy = y - dragStart.current.y;
            
            // Mutate ref directly for performance
            const el = elementsRef.current.find(e => e.id === selectedId);
            if (el) {
                el.x = elStartPos.current.x + dx;
                el.y = elStartPos.current.y + dy;
            }
            return;
        }

        if (isDrawing.current && currentEl.current) {
            if (tool === 'brush') {
                currentEl.current.points?.push({ x, y });
            } else {
                currentEl.current.width = x - dragStart.current.x;
                currentEl.current.height = y - dragStart.current.y;
            }
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        e.currentTarget.releasePointerCapture(e.pointerId);

        if (tool === 'select') {
            if (isDragging.current && selectedId) {
                pushHistory(); // Save move
            }
            isDragging.current = false;
            return;
        }

        if (isDrawing.current && currentEl.current) {
            // Commit drawing
            elementsRef.current.push(currentEl.current);
            pushHistory();
            currentEl.current = null;
        }
        isDrawing.current = false;
    };

    return (
        <canvas 
            ref={canvasRef}
            width={width}
            height={height}
            className={`absolute inset-0 z-50 touch-none ${tool === 'select' ? 'cursor-default' : 'cursor-crosshair'}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        />
    );
});
