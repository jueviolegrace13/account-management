import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PortalDropdownProps {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
}

const PortalDropdown: React.FC<PortalDropdownProps> = ({ open, anchorRef, children }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && anchorRef.current && dropdownRef.current) {
      const anchorRect = anchorRef.current.getBoundingClientRect();
      dropdownRef.current.style.position = 'absolute';
      dropdownRef.current.style.left = `${anchorRect.left}px`;
      dropdownRef.current.style.top = `${anchorRect.bottom + window.scrollY}px`;
      dropdownRef.current.style.width = `${anchorRect.width}px`;
      dropdownRef.current.style.zIndex = '9999';
    }
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div ref={dropdownRef}>{children}</div>,
    document.body
  );
};

export default PortalDropdown; 