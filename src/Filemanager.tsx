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
  Alert,
  Toaster,
  Label,
  ControlGroup,
  InputGroup,
} from "@blueprintjs/core";
import "./Filemanager.css";
import * as api from "./api";

const FilemanagerToaster = Toaster.create({});

function Filemanager() {
  const [nodes, setNodes] = useState(fromApi(EXAMPLE));
  const [renameFile, setRenameFile] = useState<api.File | undefined>(undefined);
  const [deleteFile, setDeleteFile] = useState<api.File | undefined>(undefined);
  const refreshContents = () => setNodes([...nodes]);

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
      forEachNode(nodes, (n) => (n.isSelected = false));
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
        <MenuItem text="Rename" icon="edit" onClick={() => setRenameFile(nodeData)} />
        <MenuItem text="Delete" icon="trash" onClick={() => setDeleteFile(nodeData)} />
      </Menu>,
      { left: e.clientX, top: e.clientY },
      () => {},
      true
    );
  };

  return (
    <div>
      <Tree
        contents={nodes}
        onNodeClick={handleNodeClick}
        onNodeCollapse={handleNodeCollapse}
        onNodeExpand={handleNodeExpand}
        onNodeContextMenu={handleContextMenu}
        className={Classes.ELEVATION_0}
      />
      <Alert
        isOpen={!!deleteFile}
        onCancel={() => setDeleteFile(undefined)}
        onConfirm={() => {
          FilemanagerToaster.show({
            message: <div>"{deleteFile?.name}" has been deleted.</div>,
            className: "bp3-dark bp3-large bp3-text-large",
            timeout: 3000,
          });
          setDeleteFile(undefined);
        }}
        className="bp3-dark bp3-large bp3-text-large"
        icon="trash"
        cancelButtonText="Cancel"
        confirmButtonText="Move to Trash"
        intent={Intent.DANGER}
      >
        <p>Are you sure you want to delete "{deleteFile?.name}"?</p>
      </Alert>
      <Alert
        isOpen={!!renameFile}
        onCancel={() => setRenameFile(undefined)}
        onConfirm={() => {
          FilemanagerToaster.show({
            message: <div>"{renameFile?.name}" has been renamed.</div>,
            className: "bp3-dark bp3-large bp3-text-large",
            timeout: 3000,
          });
          setRenameFile(undefined);
        }}
        className="bp3-dark bp3-large bp3-text-large"
        icon="edit"
        cancelButtonText="Cancel"
        confirmButtonText="Rename"
        intent={Intent.SUCCESS}
      >
        <Label>
          New file name
          <ControlGroup>
            <InputGroup placeholder={renameFile?.name} fill />
          </ControlGroup>
        </Label>
      </Alert>
    </div>
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
      rename: "rename",
      delete: "delete",
      directory: true,
      children: [
        {
          name: "File 3",
          preview: "preview",
          download: "download",
          rename: "rename",
          delete: "delete",
          directory: false,
          children: [],
        },
      ],
    },
    {
      name: "File 2",
      preview: "preview",
      download: "download",
      rename: "rename",
      delete: "delete",
      directory: false,
      children: [],
    },
  ],
};

export default Filemanager;
