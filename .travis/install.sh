#!/bin/bash

if [ $TRAVIS_OS_NAME = 'osx' ]; then
    curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --runtime dotnet --version 3.1.10
    brew install --cask powershell
else if [$TRAVIS_OS_NAME = 'linux']: then
    sudo apt-get update
    sudo apt-get install -y wget apt-transport-https software-properties-common
    wget -q https://packages.microsoft.com/config/ubuntu/16.04/packages-microsoft-prod.deb
    sudo dpkg -i packages-microsoft-prod.deb
    sudo apt-get update
    sudo apt-get install -y aspnetcore-runtime-3.1 powershell
else # windows
    # chocolatey v0.10.15 is installed on the Travis default windows image 
    choco install dotnetcore-runtime.install --version=3.1.10
    # TODO: Does the Travis default windows image have powershell?
    # TEST: Does this work?
    msiexec.exe /package PowerShell-7.1.0-win-x64.msi /quiet ADD_EXPLORER_CONTEXT_MENU_OPENPOWERSHELL=1 ENABLE_PSREMOTING=1 REGISTER_MANIFEST=1
fi