import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

function QRCodeGenerator({ value, size = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) {
          console.error('Erro ao gerar QR Code:', error);
        }
      });
    }
  }, [value, size]);

  return (
    <div className="inline-block p-4 bg-white rounded-xl shadow-lg">
      <canvas ref={canvasRef} />
    </div>
  );
}

export default QRCodeGenerator;