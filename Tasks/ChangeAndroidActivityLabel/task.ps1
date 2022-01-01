[string]$filePath = Get-VstsInput -Name sourceFile
[string]$oldActivityName = Get-VstsInput -Name oldActivityName
[string]$newActivityName = Get-VstsInput -Name newActivityName

if (!$filePath) {
    echo "!!! Source file cannot be empty";
    exit 1;
}

if (!(Test-Path $filePath)) {
    echo "!!! The current path does not exist";
    exit 1;
}

echo "Activity path: $filePath"

if (!$oldActivityName) {
    echo "!!! OldActivityName cannot be empty";
    exit 1;
}



if (!$newActivityName) {
    echo "!!! NewActivityName cannot be empty";
    exit 1;
}

echo "Change activity label from $($oldActivityName) to $($newActivityName) in $($filePath)"
Import-Module $PSScriptRoot/ps_modules/AndroidPatcher/android_patcher.psm1 -Force;

Update-ActivityName -Path $filePath -OldActivityName $oldActivityName -NewActivityName $newActivityName