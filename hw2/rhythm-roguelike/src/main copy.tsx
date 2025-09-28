import { useEffect, useRef } from 'react';

interface Player {
  x: number;
  y: number;
  size: number;
  speed: number;
}

function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const player = useRef<Player>({ x: 50, y: 50, size: 30, speed: 4 });
  const keys = useRef<Record<string, boolean>>({});

  // 鍵盤事件
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      keys.current[e.key] = true;
    }
    function handleKeyUp(e: KeyboardEvent) {
      keys.current[e.key] = false;
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 遊戲循環
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function update() {
      if (!canvas) return;
      const p = player.current;

      if (keys.current['ArrowUp']) p.y -= p.speed;
      if (keys.current['ArrowDown']) p.y += p.speed;
      if (keys.current['ArrowLeft']) p.x -= p.speed;
      if (keys.current['ArrowRight']) p.x += p.speed;

      // 邊界檢查
      if (p.x < 0) p.x = 0;
      if (p.y < 0) p.y = 0;
      if (p.x > canvas.width - p.size) p.x = canvas.width - p.size;
      if (p.y > canvas.height - p.size) p.y = canvas.height - p.size;
    }

    function draw() {
      if (!ctx) return;
      if (!canvas) return;
      const p = player.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'blue';
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    function loop() {
      update();
      draw();
      requestAnimationFrame(loop);
    }

    loop();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
    />
  );
}

export default GameCanvas;
