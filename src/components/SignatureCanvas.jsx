import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const SignatureCanvas = forwardRef(function SignatureCanvas({ label, width = 300, height = 80 }, ref) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    toDataURL: () => canvasRef.current?.toDataURL('image/png'),
    isEmpty: () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      return !data.some(v => v !== 0);
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const src = e.touches ? e.touches[0] : e;
      return {
        x: (src.clientX - rect.left) * scaleX,
        y: (src.clientY - rect.top) * scaleY,
      };
    };

    const start = (e) => { e.preventDefault(); drawing.current = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    const move = (e) => { e.preventDefault(); if (!drawing.current) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
    const end = () => { drawing.current = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);

    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('mouseup', end);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', move);
      canvas.removeEventListener('touchend', end);
    };
  }, []);

  return (
    <div className="flex flex-col gap-1">
      {label && <p className="text-xs text-gray-500 font-medium">{label}</p>}
      <div className="relative border border-gray-300 rounded-lg bg-white overflow-hidden" style={{ height }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={height * 2}
          className="w-full h-full cursor-crosshair touch-none"
        />
        <div className="absolute bottom-1 right-2 text-gray-200 text-xs pointer-events-none">(인)</div>
      </div>
    </div>
  );
});

export default SignatureCanvas;
