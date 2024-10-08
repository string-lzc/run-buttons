import { promises as fsPromises } from 'fs';
import vscode, { window } from 'vscode';
import { workspace } from 'vscode';
import { Disposable, PackageJson, Scripts } from './types';

const { readFile } = fsPromises;

export function activate(context: vscode.ExtensionContext) {
  const cwd = getWorkspaceFolderPath();

  function getWorkspaceFolderPath() {
    const workspaceFolder = workspace.workspaceFolders?.[0];
    const path = workspaceFolder?.uri.fsPath;
    return path;
  }

  async function getJsonFile<T>(path: string) {
    const fileBuffer = await readFile(path);
    const data = JSON.parse(fileBuffer.toString()) as T;
    return data;
  }

  async function getPackageJson() {
    const packageJson = await getJsonFile<PackageJson>(`${cwd}/package.json`);
    return packageJson;
  }

  /**
   * 通过 VS Code 终端执行命令
   * @param {string} command 要执行的命令
   */
  function executeInTerminal(command: string) {
    // 如果已经有打开的终端，使用它；否则创建新终端
    let terminal = vscode.window.createTerminal(command);
    terminal.show(); // 显示终端
    terminal.sendText(command); // 向终端发送命令
  }

  async function init() {
    let scripts: Scripts = {};
    // 注册命令并发送 npm start
    let npmStart = vscode.commands.registerCommand('npm.start', function () {
      executeInTerminal('npm start');
    });

    // 注册命令并发送 npm run build
    let npmBuild = vscode.commands.registerCommand('npm.build', function () {
      executeInTerminal('npm run build');
    });

    // 注册命令并发送 npm run publish
    let npmPublish = vscode.commands.registerCommand('npm.publish', function () {
      executeInTerminal('npm run publish');
    });

    // 注册命令并发送 npm run android
    let npmAndroid = vscode.commands.registerCommand('npm.android', function () {
      executeInTerminal('npm run build:android');
    });

    // 将命令添加到 context.subscriptions 中
    context.subscriptions.push(npmStart, npmBuild, npmPublish, npmAndroid);

    try {
      const packageJson = await getPackageJson();
      console.log('Loaded package.json!');
      scripts = { ...scripts, ...packageJson.scripts };
    } catch {
      console.log('No package.json found!');
    }
  }

  init();
}

export function deactivate() {}
