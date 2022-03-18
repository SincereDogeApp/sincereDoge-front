import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePopper } from "react-popper";
import { LeftClickableElementContainer, LeftMenuWrap } from "./styles";
import { LeftMenuProps } from "./types";
import getPortalRoot from "../../util/getPortalRoot";

const LeftMenu: React.FC<LeftMenuProps> = ({ items = [], isOpen = false }) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [menuElement, setMenuElement] = useState<HTMLElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(isOpen);

  const toggle = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const open = () => {
    setIsMenuOpen(true);
  };

  const close = () => {
    setIsMenuOpen(false);
  };

  // Allow for component to be controlled
  useEffect(() => {
    setIsMenuOpen(isOpen);
  }, [isOpen, setIsMenuOpen]);

  useEffect(() => {
    const handleClickOutside = ({ target }: Event) => {
      if (target instanceof Node) {
        if (
          menuElement !== null &&
          targetElement !== null &&
          !menuElement.contains(target) &&
          !targetElement.contains(target)
        ) {
          setIsMenuOpen(false);
        }
      }
    };
    if (menuElement !== null) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuElement, targetElement]);
  console.log(items)
  return (
    <>
      <LeftMenuWrap>
        {items.map(({ href, label }) => <div>{label}</div>)}
      </LeftMenuWrap>
      {/* <LeftClickableElementContainer ref={setTargetElement} onClick={toggle}>
        {component}
      </LeftClickableElementContainer>
      smssdksndsnkjdnksj
      {isMenuOpen && renderMenu} */}
    </>
  );
};

export default LeftMenu;
