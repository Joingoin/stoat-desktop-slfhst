import { ipcRenderer } from "electron";
import "./world/config";
import "./world/window";

// Listen for the prompt from main.ts to show the screen picker
ipcRenderer.on("show-screen-picker", (_event, sources) => {
  // Create a modal dialog overlay directly on the active website
  const dialog = document.createElement("dialog");
  dialog.style.cssText = `
    padding: 20px; 
    border-radius: 8px; 
    border: 1px solid #444; 
    background: #1e1e1e; 
    color: white; 
    max-width: 80%; 
    width: 800px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5); 
    font-family: sans-serif;
    z-index: 999999;
    
    /* --- NEW CENTERING CSS --- */
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
  `;

  dialog.innerHTML = `
    <h2 style="margin-top: 0; margin-bottom: 20px; color: white;">Share your screen</h2>
    <div id="sources-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; max-height: 60vh; overflow-y: auto; padding-right: 10px;"></div>
    <div style="margin-top: 20px; text-align: right;">
      <button id="cancel-btn" style="padding: 10px 20px; background: #333; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
    </div>
  `;

  document.body.appendChild(dialog);
  const list = dialog.querySelector("#sources-list")!;

  // Populate the grid with clickable screens & windows
  sources.forEach((source: any) => {
    const item = document.createElement("div");
    item.style.cssText = `
      display: flex; flex-direction: column; align-items: center; 
      cursor: pointer; padding: 10px; border-radius: 8px; background: #2a2a2a;
      transition: background 0.2s;
    `;

    item.onmouseenter = () => item.style.background = "#4a4a4a";
    item.onmouseleave = () => item.style.background = "#2a2a2a";

    item.innerHTML = `
      <img src="${source.thumbnail}" style="width: 100%; height: auto; border-radius: 4px; border: 1px solid #000; pointer-events: none;" />
      <span style="margin-top: 10px; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; text-align: center; pointer-events: none; color: white;">
        ${source.name}
      </span>
    `;

    // Send the choice directly back to Electron when clicked
    item.onclick = () => {
      ipcRenderer.send("screen-picker-result", source.id);
      dialog.remove();
    };

    list.appendChild(item);
  });

  // Handle Cancel button
  dialog.querySelector("#cancel-btn")!.addEventListener("click", () => {
    ipcRenderer.send("screen-picker-result", null); 
    dialog.remove(); 
  });

  // Display the modal
  dialog.showModal();
});