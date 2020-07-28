import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Button, Drawer } from "@blueprintjs/core";
import MenuBar from "./Menubar";

function App() {
  const [menubarVisible, setMenubarVisibility] = useState(true);

  return (
    <div className="App bp3-dark">
      <Drawer
        className="bp3-dark"
        isOpen={menubarVisible}
        size="25%"
        position="left"
        hasBackdrop={false}
        canOutsideClickClose={true}
        onClose={() => setMenubarVisibility(false)}
      >
        <MenuBar />
      </Drawer>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more React
        </a>
        <Button
          icon="menu"
          onClick={() => setMenubarVisibility(!menubarVisible)}
        />
      </header>
    </div>
  );
}

export default App;
