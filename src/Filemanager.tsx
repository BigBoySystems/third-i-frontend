import React, { useState, useEffect } from "react";
import {
  Tree,
  ITreeNode,
  Intent,
  Classes,
  ContextMenu,
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
import { MockApi } from "./App";

const FilemanagerToaster = Toaster.create({});

function Filemanager() {
  return <MockApi.Consumer>{(mockApi) => <FilemanagerInner mockApi={mockApi} />}</MockApi.Consumer>;
}

function FilemanagerInner({ mockApi }: MockApi) {
  const [initialized, setInitialized] = useState(false);
  const [nodes, setNodes] = useState<ITreeNode<api.File>[]>([]);
  const [renameFile, setRenameFile] = useState<ITreeNode<api.File> | undefined>(undefined);
  const [newName, setNewName] = useState("");
  const [deleteFile, setDeleteFile] = useState<[api.File, number[]] | undefined>(undefined);
  const refreshContents = () => setNodes([...nodes]);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      if (mockApi) {
        setTimeout(() => setNodes(fromApi(SAMPLE_FILES)), 1500);
      } else {
        api
          .getFiles()
          .then((root) => setNodes(fromApi(root)))
          .catch((err) => console.log("Could not load files from API:", err));
      }
    }
  }, [initialized, mockApi]);

  const forEachNode = (nodes: ITreeNode[], callback: (node: ITreeNode) => void) => {
    for (const node of nodes) {
      callback(node);
      forEachNode(node.childNodes || [], callback);
    }
  };

  const handleNodeClick = (
    node: ITreeNode<api.File>,
    _nodePath: number[],
    e: React.MouseEvent<HTMLElement>
  ) => {
    const originallySelected = node.isSelected;
    if (!e.shiftKey) {
      forEachNode(nodes, (n) => (n.isSelected = false));
    }
    node.isSelected = originallySelected == null ? true : !originallySelected;
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
    node: ITreeNode<api.File>,
    nodePath: number[],
    e: React.MouseEvent<HTMLElement>
  ) => {
    e.preventDefault();

    ContextMenu.show(
      <Menu>
        <MenuDivider title={node.label} />
        {!node.nodeData!.directory && (
          <MenuItem
            text="Preview"
            icon="eye-open"
            href={`${node.nodeData!.url}?disposition=inline`}
            target="_blank"
          />
        )}
        {!node.nodeData!.directory && (
          <MenuItem
            text="Download"
            icon="download"
            href={`${node.nodeData!.url}?disposition=attachment`}
          />
        )}
        <MenuItem
          text="Rename"
          icon="edit"
          onClick={() => {
            setRenameFile(node);
            setNewName(node.nodeData!.name);
          }}
        />
        <MenuItem
          text="Delete"
          icon="trash"
          onClick={() => setDeleteFile([node.nodeData!, nodePath])}
        />
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
        isOpen={deleteFile !== undefined}
        onCancel={() => setDeleteFile(undefined)}
        onConfirm={() => {
          if (deleteFile === undefined) {
            throw new Error("assertion error: must not be undefined");
          }

          setDeleteFile(undefined);

          fetch(deleteFile[0].url, {
            method: "DELETE",
          })
            .then((resp) => resp.json())
            .then((data: api.Response) => {
              if (data!.success) {
                FilemanagerToaster.show({
                  message: <div>"{deleteFile[0].name}" has been deleted.</div>,
                  className: "bp3-dark bp3-large bp3-text-large",
                  timeout: 3000,
                });
              } else {
                FilemanagerToaster.show({
                  message: (
                    <div>
                      <p>Could not delete file "{deleteFile[0].name}".</p>
                      {data!.reason && <p>{data!.reason}</p>}
                    </div>
                  ),
                  className: "bp3-dark bp3-large bp3-text-large",
                  timeout: 3000,
                  intent: Intent.DANGER,
                });
              }
            });
        }}
        className="bp3-dark bp3-large bp3-text-large"
        icon="trash"
        cancelButtonText="Cancel"
        confirmButtonText="Move to Trash"
        intent={Intent.DANGER}
      >
        <p>Are you sure you want to delete "{deleteFile && deleteFile[0].name}"?</p>
      </Alert>
      <Alert
        isOpen={renameFile !== undefined}
        onCancel={() => setRenameFile(undefined)}
        onConfirm={() => {
          if (renameFile === undefined) {
            throw new Error("assertion error: must not be undefined");
          }

          setRenameFile(undefined);

          const body = {
            dst: `${renameFile.nodeData!.path}/${newName}`,
          };
          const apiCall = mockApi
            ? new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1500))
            : fetch(renameFile.nodeData!.url, {
                method: "PATCH",
                body: JSON.stringify(body),
                headers: {
                  "Content-Type": "application/json;charset=utf-8",
                },
              }).then((resp) => resp.json());

          apiCall.then((data: any) => {
            if (data!.success) {
              FilemanagerToaster.show({
                message: <div>"{renameFile.nodeData!.name}" has been renamed.</div>,
                className: "bp3-dark bp3-large bp3-text-large",
                timeout: 3000,
              });
              renameFile.label = newName;
              renameFile.nodeData!.name = newName;
              refreshContents();
            } else {
              FilemanagerToaster.show({
                message: (
                  <div>
                    <p>Could not rename file "{renameFile.nodeData!.name}".</p>
                    {data!.reason && <p>{data!.reason}</p>}
                  </div>
                ),
                className: "bp3-dark bp3-large bp3-text-large",
                timeout: 3000,
                intent: Intent.DANGER,
              });
            }
          });
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
            <InputGroup
              placeholder="File name"
              fill
              defaultValue={newName}
              onChange={(ev: any) => setNewName(ev.target.value)}
            />
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
    childNodes: child.children?.map(transform),
    nodeData: child,
  });

  return root.children.map(transform);
}

const SAMPLE_FILES: api.File = {
  name: "/",
  path: "",
  url: "/files",
  directory: true,
  children: [
    {
      name: "Dir 1",
      path: "",
      url: "/files/dir1",
      directory: true,
      children: [
        {
          name: "File 3",
          path: "dir1",
          url: "/files/dir1/file3",
          directory: false,
          children: [],
        },
      ],
    },
    {
      name: "Dir 2",
      path: "",
      url: "/files/dir2",
      directory: true,
      children: [
        {
          name: "File 4",
          path: "dir2",
          url: "/files/dir2/file4",
          directory: false,
          children: [],
        },
        {
          name: "File 5",
          path: "dir2",
          url: "/files/dir2/file5",
          directory: false,
          children: [],
        },
      ],
    },
    {
      name: "File 2",
      path: "",
      url: "/files/file2",
      directory: false,
      children: [],
    },
  ],
};

export default Filemanager;
