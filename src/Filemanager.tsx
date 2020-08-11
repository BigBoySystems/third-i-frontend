import React, { useState } from "react";
import {
  Tree,
  ITreeNode,
  Tooltip,
  Icon,
  Position,
  Intent,
  Classes,
  ContextMenu,
  TreeEventHandler,
  Menu,
  MenuItem,
  MenuDivider,
} from "@blueprintjs/core";
import "./Filemanager.css";
import * as api from "./api";

function Filemanager() {
  const [contents, setContents] = useState(fromApi(EXAMPLE));
  const refreshContents = () => setContents([...contents]);

  const forEachNode = (nodes: ITreeNode[], callback: (node: ITreeNode) => void) => {
    for (const node of nodes) {
      callback(node);
      forEachNode(node.childNodes || [], callback);
    }
  };

  const handleNodeClick = (
    nodeData: ITreeNode,
    _nodePath: number[],
    e: React.MouseEvent<HTMLElement>
  ) => {
    const originallySelected = nodeData.isSelected;
    if (!e.shiftKey) {
      forEachNode(contents, (n) => (n.isSelected = false));
    }
    nodeData.isSelected = originallySelected == null ? true : !originallySelected;
    refreshContents();
  };

  const handleNodeCollapse = (nodeData: ITreeNode) => {
    nodeData.isExpanded = false;
    refreshContents();
  };

  const handleNodeExpand = (nodeData: ITreeNode) => {
    nodeData.isExpanded = true;
    refreshContents();
  };

  const handleContextMenu = (
    { label, nodeData }: ITreeNode<api.File>,
    _nodePath: number[],
    e: React.MouseEvent<HTMLElement>
  ) => {
    e.preventDefault();
    ContextMenu.show(
      <Menu>
        <MenuDivider title={label} />
        {!nodeData?.directory && (
          <MenuItem text="Preview" icon="eye-open" href={nodeData?.preview} />
        )}
        {!nodeData?.directory && (
          <MenuItem text="Download" icon="download" href={nodeData?.download} />
        )}
        <MenuItem text="Rename" icon="edit" />
        <MenuItem text="Delete" icon="trash" />
      </Menu>,
      { left: e.clientX, top: e.clientY },
      () => {},
      true
    );
  };

  return (
    <Tree
      contents={contents}
      onNodeClick={handleNodeClick}
      onNodeCollapse={handleNodeCollapse}
      onNodeExpand={handleNodeExpand}
      onNodeContextMenu={handleContextMenu}
      className={Classes.ELEVATION_0}
    />
  );
}

function fromApi(root: api.File): ITreeNode<api.File>[] {
  const transform = (child: api.File): ITreeNode<api.File> => ({
    id: child.name,
    icon: child.directory ? "folder-close" : "document",
    label: child.name,
    hasCaret: child.directory,
    childNodes: child.children.map(transform),
    nodeData: child,
  });

  return root.children.map(transform);
}

const EXAMPLE: api.File = {
  name: "/",
  directory: true,
  children: [
    {
      name: "Dir 1",
      directory: true,
      children: [
        {
          name: "File 3",
          preview: "preview",
          download: "download",
          directory: false,
          children: [],
        },
      ],
    },
    {
      name: "File 2",
      preview: "preview",
      download: "download",
      directory: false,
      children: [],
    },
  ],
};

export default Filemanager;
