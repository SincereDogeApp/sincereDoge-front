import React from "react";
import { FlexProps } from "../Box";
import LeftMenu from "./LeftMenu";
import { LeftSubMenuContainer } from "./styles";
import { LeftMenuProps } from "./types";

const SubMenu: React.FC<LeftMenuProps & FlexProps> = ({ children, component, options, isOpen = false, ...props }) => {
  return (
    <LeftMenu component={component} options={options} isOpen={isOpen}>
      <LeftSubMenuContainer {...props}>{children}</LeftSubMenuContainer>
    </LeftMenu>
  );
};

export default SubMenu;
