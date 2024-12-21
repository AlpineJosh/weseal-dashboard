import path from 'path';
import pkg from 'fs-extra';

const { copy, emptyDir, writeFile, mkdirSync } = pkg;

async function createDeploymentPackage() {
  const deployDir = "deploy";

  await emptyDir(deployDir);

  await Promise.all([
    mkdirSync(path.join(deployDir, 'daemon'), { recursive: true }),
    mkdirSync(path.join(deployDir, 'logs'), { recursive: true })
  ]);

  await Promise.all([
    copy(
      path.join("dist", "sage-sync.exe"),
      path.join(deployDir, "sage-sync.exe")
    ),
    copy("config.json", path.join(deployDir, "config.json")),
    copy(
      path.join(process.cwd(), "..", "..", "node_modules", "node-windows", "bin", "winsw", "winsw.exe"),
      path.join(deployDir, "node_modules", "node-windows", "bin", "winsw", "winsw.exe")
    )
  ]);

  await writeFile(
    path.join(deployDir, "install.bat"),
    "@echo off\n" +
      "echo Installing Sage Sync Service...\n" +
      "\"%~dp0sage-sync.exe\" --install\n" +
      "pause",
  );

  await writeFile(
    path.join(deployDir, "uninstall.bat"),
    "@echo off\n" +
      "echo Uninstalling Sage Sync Service...\n" +
      "\"%~dp0sage-sync.exe\" --uninstall\n" +
      "pause",
  );

  await writeFile(
    path.join(deployDir, "README.txt"),
    "Sage Sync Service\n" +
      "================\n\n" +
      "1. Edit config.json with your database settings\n" +
      "2. Run install.bat as Administrator\n" +
      "3. Service will start automatically\n" +
      "4. Check logs folder for operation logs\n",
  );
}

const main = async () => {
  try {
    await createDeploymentPackage();
    console.log('Deployment package created successfully');
  } catch (error) {
    console.error('Error creating deployment package:', error);
    process.exit(1);
  }
};

main();
