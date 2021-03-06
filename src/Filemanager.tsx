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
import numeral from "numeral";

const FilemanagerToaster = Toaster.create({});

// wrapper component to get the mockApi property from context
function Filemanager() {
  return <MockApi.Consumer>{(mockApi) => <FilemanagerInner mockApi={mockApi} />}</MockApi.Consumer>;
}

// inner component (requires the mockApi property)
function FilemanagerInner({ mockApi }: MockApi) {
  const [initialized, setInitialized] = useState(false);
  const [nodes, setNodes] = useState<ITreeNode<api.File>[]>([]);
  const [renameFile, setRenameFile] = useState<ITreeNode<api.File> | undefined>(undefined);
  const [newName, setNewName] = useState("");
  const [deleteFile, setDeleteFile] = useState<[api.File, number[]] | undefined>(undefined);
  const refreshContents = () => setNodes([...nodes]);

  // initalize the file manager by retrieving the third-i user files
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      if (mockApi) {
        // return a sample when you are in mockApi mode
        setTimeout(() => setNodes(fromApi(SAMPLE_FILES)), 500);
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

  // remove a node (when you remove a file)
  const removeNode = (nodePath: number[]) => {
    const [tail] = nodePath.splice(-1, 1);

    if (nodePath.length === 0) {
      nodes.splice(tail, 1);
    } else {
      const node = Tree.nodeFromPath(nodePath, nodes);
      const { childNodes } = node;

      if (childNodes === undefined) {
        throw new Error("assertion: childNodes must not be undefined");
      }
      childNodes.splice(tail, 1);
    }

    refreshContents();
  };

  //when a node is selected
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

  // handler for when the user collapse a node (click on the caret)
  const handleNodeCollapse = (nodeData: ITreeNode) => {
    nodeData.isExpanded = false;
    refreshContents();
  };

  // handler for when the user expand a node (click on the caret)
  const handleNodeExpand = (nodeData: ITreeNode) => {
    nodeData.isExpanded = true;
    refreshContents();
  };
  
  // right click on a node
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
        <MenuItem text="Export in Zip" icon="compressed" disabled />
      </Menu>,
      { left: e.clientX, top: e.clientY },
      () => {},
      true
    );
  };
  

  const confirmRenameFile = () => {
    if (renameFile === undefined) {
      throw new Error("assertion error: must not be undefined");
    }

    // reset the state to undefined to disable the renaming dialog (alert)
    setRenameFile(undefined);

    const body = {
      dst: `${renameFile.nodeData!.path}/${newName}`,
    };
    const apiCall: Promise<api.RenameFile> = mockApi
      ? new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                file: {
                  ...(renameFile.nodeData as api.File),
                  name: newName,
                },
              }),
            500
          )
        )
      : api.callApi(
          renameFile.nodeData!.url,
          {
            method: "PATCH",
          },
          body
        );

    apiCall.then((data) => {
      if (data.success) {
        FilemanagerToaster.show({
          message: (
            <div>
              "{renameFile.nodeData!.name}" has been renamed to "{newName}".
            </div>
          ),
          className: "bp3-dark bp3-large bp3-text-large",
          timeout: 3000,
        });
        renameFile.label = newName;
        renameFile.nodeData = data.file;
        refreshContents();
      } else {
        FilemanagerToaster.show({
          message: (
            <div>
              <p>Could not rename file "{renameFile.nodeData!.name}".</p>
              {data.reason && <p>{data.reason}</p>}
            </div>
          ),
          className: "bp3-dark bp3-large bp3-text-large",
          timeout: 3000,
          intent: Intent.DANGER,
        });
      }
    });
  };

  return (
    <div>
      <Tree
        contents={nodes}
        onNodeClick={handleContextMenu}// Event left click on node
        onNodeCollapse={handleNodeCollapse}// Event left click on carret of node to collapse
        onNodeExpand={handleNodeExpand}// Event left click on carret of node to expand
        onNodeContextMenu={handleContextMenu}// Event right click on node
        className={Classes.ELEVATION_0}
      />
      <Alert
        isOpen={deleteFile !== undefined}
        onCancel={() => setDeleteFile(undefined)}
        onConfirm={() => {
          if (deleteFile === undefined) {
            throw new Error("assertion error: must not be undefined");
          }

          // reset the state to undefined to disable the alert (dialog)
          setDeleteFile(undefined);

          const apiCall: Promise<api.Response> = mockApi
            ? new Promise((resolve) =>
                setTimeout(
                  () =>
                    resolve({
                      success: true,
                    }),
                  500
                )
              )
            : api.callApi(deleteFile[0].url, {
                method: "DELETE",
              });

          apiCall.then((data) => {
            if (data.success) {
              FilemanagerToaster.show({
                message: <div>"{deleteFile[0].name}" has been deleted.</div>,
                className: "bp3-dark bp3-large bp3-text-large",
                timeout: 3000,
              });
              removeNode(deleteFile[1]);
            } else {
              FilemanagerToaster.show({
                message: (
                  <div>
                    <p>Could not delete file "{deleteFile[0].name}".</p>
                    {data.reason && <p>{data.reason}</p>}
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
        onConfirm={confirmRenameFile}
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
              onChange={(ev: any) => {
                setNewName(ev.target.value);
              }}
              onKeyUp={(ev) => {
                if (ev.key === "Enter") {
                  confirmRenameFile();
                }
              }}
              autoFocus
            />
          </ControlGroup>
        </Label>
      </Alert>
    </div>
  );
}

function fromApi(root: api.File): ITreeNode<api.File>[] {
  const transform = (child: api.File, currentNodePath: string[]): ITreeNode<api.File> => {
    const [currentNode, ...currentNodeRest] = currentNodePath;

    return {
      id: child.name,
      icon: child.directory ? "folder-close" : "document",
      label: child.name,
      hasCaret: child.directory,
      childNodes: child.children
        ?.map((x) => transform(x, currentNodeRest))
        .sort((a, b) => (a.label < b.label ? -1 : 1)),
      nodeData: child,
      isExpanded: child.directory && child.name === currentNode ? true : false,
    };
  };

  const now = new Date();
  const currentNodePath: string[] = [
    "DCIM",
    numeral(now.getFullYear()).format("0000"),
    numeral(now.getMonth() + 1).format("00"),
    numeral(now.getDate()).format("00"),
  ];
  return root.children.map((x) => transform(x, currentNodePath));
}

// configuration file sample of the mockApi mode
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
          name: "Dir 3",
          path: "dir2",
          url: "/files/dir2/dir3",
          directory: true,
          children: [
            {
              name: "File 4",
              path: "dir2/dir3",
              url: "/files/dir2/dir3/file4",
              directory: false,
              children: [],
            },
            {
              name: "File 5",
              path: "dir2/dir3",
              url: "/files/dir2/dir3/file5",
              directory: false,
              children: [],
            },
          ],
        },
        {
          name: "File 6",
          path: "dir2",
          url: "/files/dir2/file6",
          directory: false,
          children: [],
        },
        {
          name: "File 7",
          path: "dir2",
          url: "/files/dir2/file7",
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
