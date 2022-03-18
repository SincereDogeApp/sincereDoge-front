import { ReactNode } from "react";
import { Placement, Padding } from "@popperjs/core";
import { MenuItemsType } from "../MenuItems/types";

export interface MenuOptions {
  placement?: Placement;
  offset?: [number, number];
  padding?: Padding;
}

export interface LeftMenuProps {
  items: MenuItemsType[],
  isOpen?: boolean;
}
