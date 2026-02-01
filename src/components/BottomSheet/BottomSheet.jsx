import React from "react";
import "./bottomsheet.css";
import { useEffect } from "react";
import { useRef, useState } from "react";

function BottomSheet({ open, onClose, children, isAtTop }) {

  const sheetRef = useRef(null);
  const startY = useRef(0);
  const [dragY, setDragY] = useState(0);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const onTouchStart = (e) => {
    if (!isAtTop.current) return;
    startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e) => {
    if (!isAtTop.current) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      setDragY(diff);
    }
  };

  const onTouchEnd = () => {
    if (dragY > 120) {
      onClose();
    }
    setDragY(0);
  };

  return (
    <>
      <div className="backdrop" onClick={onClose} >
        <div
          ref={sheetRef}
          className="bottom-sheet"
          style={{ transform: `translateY(${dragY}px)` }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="handle" />
          {children}
        </div>
      </div>
    </>
  );
}
export default BottomSheet;