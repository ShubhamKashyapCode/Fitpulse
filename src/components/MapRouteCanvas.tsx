import React, { useEffect, useRef } from 'react';
import { GpsPoint } from '../types/fitness';

interface MapRouteCanvasProps {
  points: GpsPoint[];
  className?: string;
  isLive?: boolean;
}

export const MapRouteCanvas: React.FC<MapRouteCanvasProps> = ({ points, className = '', isLive = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#141923';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid
    ctx.strokeStyle = '#1e2638';
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (points.length < 2) {
      // Draw placeholder or single point
      if (points.length === 1) {
        ctx.fillStyle = '#00E676';
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#003919';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = '#64748b';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GPS Route will appear here during workout', width / 2, height / 2);
      }
      return;
    }

    // Determine bounding box
    let minLat = points[0].latitude;
    let maxLat = points[0].latitude;
    let minLng = points[0].longitude;
    let maxLng = points[0].longitude;

    points.forEach((pt) => {
      minLat = Math.min(minLat, pt.latitude);
      maxLat = Math.max(maxLat, pt.latitude);
      minLng = Math.min(minLng, pt.longitude);
      maxLng = Math.max(maxLng, pt.longitude);
    });

    const latSpan = Math.max(0.0005, maxLat - minLat);
    const lngSpan = Math.max(0.0005, maxLng - minLng);

    const padding = 36;
    const plotW = width - padding * 2;
    const plotH = height - padding * 2;

    const toScreen = (pt: GpsPoint) => {
      const x = padding + ((pt.longitude - minLng) / lngSpan) * plotW;
      const y = height - padding - ((pt.latitude - minLat) / latSpan) * plotH;
      return { x, y };
    };

    // Draw route glow
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.25)';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach((pt, idx) => {
      const { x, y } = toScreen(pt);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw main polyline
    ctx.strokeStyle = '#00E676';
    ctx.lineWidth = 4;
    ctx.beginPath();
    points.forEach((pt, idx) => {
      const { x, y } = toScreen(pt);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Start marker (Green)
    const startPos = toScreen(points[0]);
    ctx.fillStyle = '#00E676';
    ctx.beginPath();
    ctx.arc(startPos.x, startPos.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // End/Current marker
    const endPos = toScreen(points[points.length - 1]);
    ctx.fillStyle = isLive ? '#00B0FF' : '#FF5252';
    ctx.beginPath();
    ctx.arc(endPos.x, endPos.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (isLive) {
      // Pulse ring for live position
      ctx.strokeStyle = 'rgba(0, 176, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(endPos.x, endPos.y, 14, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [points, isLive]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-[#283144] shadow-inner ${className}`}>
      <canvas ref={canvasRef} width={400} height={220} className="w-full h-full object-cover block" />
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] text-slate-400 font-mono">
        {points.length} GPS Coordinates
      </div>
      {isLive && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full text-[10px] font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Live GPS Route
        </div>
      )}
    </div>
  );
};
