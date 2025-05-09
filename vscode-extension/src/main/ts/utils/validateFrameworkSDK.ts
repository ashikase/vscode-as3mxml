/*
Copyright 2016-2025 Bowler Hat LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

/**
 * Checks if the path contains a valid SDK. May return a modified path, in the
 * case of an Apache Royale SDK where the real SDK appears in royale-asjs.
 * Returns null if the SDK is not valid.
 */
export default function validateFrameworkSDK(
  sdkPath: string | null | undefined
): string | null {
  if (!sdkPath) {
    return null;
  }
  if (validatePossibleFrameworkSDK(sdkPath)) {
    return sdkPath;
  }
  //if it's an Apache Royale SDK, the "real" SDK might be inside the
  //royale-asjs directory instead of at the root
  let royalePath = path.join(sdkPath, "royale-asjs");
  if (validatePossibleFrameworkSDK(royalePath)) {
    return royalePath;
  }
  return null;
}

function validatePossibleFrameworkSDK(sdkPath: string): boolean {
  if (!sdkPath) {
    return false;
  }

  if (!path.isAbsolute(sdkPath)) {
    if (vscode.workspace.workspaceFile !== undefined) {
      sdkPath = path.join(
        path.dirname(vscode.workspace.workspaceFile.fsPath),
        sdkPath
      );
    } else {
      if (vscode.workspace.workspaceFolders !== undefined) {
        sdkPath = path.join(
          vscode.workspace.workspaceFolders[0].uri.fsPath,
          sdkPath
        );
      } else {
        return false;
      }
    }
  }

  //a frameworks directory is required
  let frameworksPath = path.join(sdkPath, "frameworks");
  if (
    !fs.existsSync(frameworksPath) ||
    !fs.statSync(frameworksPath).isDirectory()
  ) {
    return false;
  }
  //a bin directory is required
  let binPath = path.join(sdkPath, "bin");
  if (!fs.existsSync(binPath) || !fs.statSync(binPath).isDirectory()) {
    return false;
  }
  //one of these files to describe the SDK is required
  let airDescription = path.join(sdkPath, "air-sdk-description.xml");
  let flexDescription = path.join(sdkPath, "flex-sdk-description.xml");
  let royaleDescription = path.join(sdkPath, "royale-sdk-description.xml");
  if (
    !fs.existsSync(airDescription) &&
    !fs.existsSync(flexDescription) &&
    !fs.existsSync(royaleDescription)
  ) {
    return false;
  }
  return true;
}
