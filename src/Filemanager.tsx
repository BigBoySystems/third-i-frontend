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
  // implementation of a mockApi mode in the filemanager
  return <MockApi.Consumer>{(mockApi) => <FilemanagerInner mockApi={mockApi} />}</MockApi.Consumer>;
}

function FilemanagerInner({ mockApi }: MockApi) {
  // inner of the filemanager with mockApi mode
  const [initialized, setInitialized] = useState(false);
  const [nodes, setNodes] = useState<ITreeNode<api.File>[]>([]);
  const [renameFile, setRenameFile] = useState<ITreeNode<api.File> | undefined>(undefined);
  const [newName, setNewName] = useState("");
  const [deleteFile, setDeleteFile] = useState<[api.File, number[]] | undefined>(undefined);
  const refreshContents = () => setNodes([...nodes]);

  useEffect(() => {
    // initalize the filemanager and retrive the third-i user files
    if (!initialized) {
      setInitialized(true);
      if (mockApi) {
        setTimeout(() => setNodes(fromApi(SAMPLE_FILES)), 500); // return a sample when you are in mockApi mode
      } else {
        api
          .getFiles()
          .then((root) => setNodes(fromApi(root)))
          .catch((err) => console.log("Could not load files from API:", err));
      }
    }
  }, [initialized, mockApi]);

  const forEachNode = (nodes: ITreeNode[], callback: (node: ITreeNode) => void) => {
    // set the node (a file is represented by a node)
    for (const node of nodes) {
      callback(node);
      forEachNode(node.childNodes || [], callback);
    }
  };

  const removeNode = (nodePath: number[]) => {
    // add the possibility to remove a node when you remove a file
    const [tail] = nodePath.splice(-1, 1);

    if (nodePath.length === 0) {
      nodes.splice(tail, 1);
    } else {
      const node = getNodeFromPath(nodes, nodePath);
      const { childNodes } = node;

      if (childNodes === undefined) {
        throw new Error("assertion: childNodes must not be undefined");
      }
      childNodes.splice(tail, 1);
    }

    refreshContents();
  };

  const handleNodeClick = (
    // set when you click on a node
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
    // set when you collapse after go up in the node tree
    nodeData.isExpanded = false;
    refreshContents();
  };

  const handleNodeExpand = (nodeData: ITreeNode) => {
    // set when you expend after go down in the node tree
    nodeData.isExpanded = true;
    refreshContents();
  };

  const handleContextMenu = (
    // set the option you can use for each node
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

  const confirmRenameFile = () => {
    if (renameFile === undefined) {
      throw new Error("assertion error: must not be undefined");
    }

    setRenameFile(undefined); // management when you try to rename a file

    const body = {
      dst: `${renameFile.nodeData!.path}/${newName}`,
    };
    const apiCall: Promise<api.RenameFile> = mockApi
      ? new Promise((
          resolve // when you are in mockApi mode
        ) =>
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
      : fetch(renameFile.nodeData!.url, {
          // when you are not in mockApi mode
          method: "PATCH",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
        }).then((resp) => resp.json());

    apiCall.then((data: any) => {
      // when the renaming is successfull
      if (data!.success) {
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
        // when the renaming is not successfull
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

          setDeleteFile(undefined); // management

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
            : fetch(deleteFile[0].url, {
                method: "DELETE",
              }).then((resp) => resp.json());

          apiCall.then((data) => {
            if (data!.success) {
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

// display the node tree about the path of each file
function getNodeFromPath<T>(nodes: ITreeNode<T>[], path: number[]): ITreeNode<T> {
  if (path.length === 0) {
    throw new Error("assertion error: getNodeFromPath called with empty path");
  }

  const find = (root: ITreeNode<T>, path: number[]): ITreeNode<T> => {
    const [i, ...rest] = path;

    if (root.childNodes === undefined) {
      throw new Error("assertion error: childNodes must not be undefined");
    }

    const node = root.childNodes[i];

    if (rest.length === 0) {
      return node;
    } else if (node === undefined) {
      throw new Error("assertion error: rest is not empty but node is undefined");
    } else {
      return find(node, rest);
    }
  };

  const [i, ...rest] = path;

  if (rest.length === 0) {
    return nodes[i];
  } else {
    return find(nodes[i], rest);
  }
}

const SAMPLE_FILES: api.File = {
  // configuration file sample of the mockApi mode
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
