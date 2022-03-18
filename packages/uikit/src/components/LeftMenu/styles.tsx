import styled from "styled-components";
import { Box, Flex } from "../Box";

export const LeftMenuContainer = styled(Box)`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: ${({ theme }) => theme.shadows.tooltip};
`;

export const LeftSubMenuContainer = styled(Flex)`
  flex-direction: column;
  overflow: hidden;
  min-width: 136px;
  background: ${({ theme }) => theme.colors.input};
  border-radius: ${({ theme }) => theme.radii.default};
  border: ${({ theme }) => `1px solid ${theme.colors.inputSecondary}`};
`;

export const LeftClickableElementContainer = styled.div`
  cursor: pointer;
  display: inline-flex;
`;

export const LeftSubMenuItem = styled.button`
  border: 0;
  outline: 0;
  cursor: pointer;
  background: transparent;
  padding: 8px 16px;
  color: ${({ theme }) => theme.colors.text};
  width: 100%;
  font-size: 16px;
  text-align: left;

  &:hover {
    background-color: ${({ theme }) => theme.colors.inputSecondary};
    text-decoration: none;
  }
`;

export const LeftMenuWrap = styled.div`
  position:fixed;
  top:56px;
  left:0;
  width:60%;
  height:100vh;
  z-index:1;
  background-color:#fff;
`
