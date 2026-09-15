const knob = document.getElementById('cutoff-knob') as HTMLImageElement | null;
let currentAngle = -135;

if (knob) {
  knob.addEventListener('mousedown', (e: MouseEvent) => {
    let startY = e.clientY;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY;
      startY = moveEvent.clientY;

      currentAngle = Math.min(135, Math.max(-135, currentAngle + deltaY * 1.5));
      knob.style.transform = `rotate(${currentAngle}deg)`;
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });
}