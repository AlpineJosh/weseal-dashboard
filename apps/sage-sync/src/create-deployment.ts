import * as path from "path";
import * as fs from "fs-extra";

async function createDeploymentPackage() {
  const deployDir = "deploy";

  await fs.emptyDir(deployDir);

  await fs.copy(
    path.join("dist", "sage-sync.exe"),
    path.join(deployDir, "sage-sync.exe"),
  );

  await fs.copy("config.json", path.join(deployDir, "config.json"));

  await fs.writeFile(
    path.join(deployDir, "install.bat"),
    "@echo off\n" +
      "echo Installing Sage Sync Service...\n" +
      "sage-sync.exe --install\n" +
      "pause",
  );

  await fs.writeFile(
    path.join(deployDir, "uninstall.bat"),
    "@echo off\n" +
      "echo Uninstalling Sage Sync Service...\n" +
      "sage-sync.exe --uninstall\n" +
      "pause",
  );

  await fs.writeFile(
    path.join(deployDir, "README.txt"),
    "Sage Sync Service\n" +
      "================\n\n" +
      "1. Edit config.json with your database settings\n" +
      "2. Run install.bat as Administrator\n" +
      "3. Service will start automatically\n" +
      "4. Check logs folder for operation logs\n",
  );
}

createDeploymentPackage().catch(console.error);
