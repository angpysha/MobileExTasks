function JsonItemPatch($jObject,
                       [string[]] $key,
                       $value) 
{
    $keyLength = $key.Count;
    
    $node = $jObject.Item($key[0]);

    if ($keyLength -gt 1) {
        for ($i = 1; $i -lt $keyLength; $i++) {
            $node = $node.Item($key[$i]);
        }
    }

    $node.Value = $value;
}

function InstallJson() 
{
    Install-Package -Name Newtonsoft.Json -ProviderName Nuget -RequiredVersion 13.0.1 -Scope CurrentUser -SkipDependencies -Destination . -Force

    $resolve = Resolve-Path ./Newtonsoft.Json.13.0.1/lib/netstandard2.0/Newtonsoft.Json.dll
    [System.Reflection.Assembly]::LoadFrom($resolve)
}

function CreateKeysArray($stringKey) 
{
    $keys = $stringKey.Split(".");
    return $keys;
}

function Update-Json {
    param (
        [string]$Path,
        [string[][]]$Values
    )

    if (!$Path) {
        echo "!!! Path cannot be empty";
        exit 1;
    }

    if (!(Test-Path $Path)){
        echo "!!! The current path is not exist";
        exit 1;
    }

    if (!$Values) {
        echo "!!! Values cannot be empty";
        exit 1;
    }

    foreach ($item in $Values) {
        $key = $item[0]
        $value = $item[1]

        $keysArray = CreateKeysArray($key)

        InstallJson;

        $jObject = [Newtonsoft.Json.Linq.JObject]::Parse((Resolve-Path $Path));

        JsonItemPatch($jObject, $keysArray, $value);

        $jsonString = $jObject.ToString();

        $jsonString | Set-Content -Path $Path;
    }
}

function Update-AndroidResources {
    param (
        [string]$Path,
        [string[][]]$KeyValues,
        $printFile = $true
    )
    
    if (!$Path) {
        echo "!!! Path cannot be empty";
        exit 1;
    }

    if (!(Test-Path $Path)){
        echo "!!! The current path is not exist";
        exit 1;
    }

    if (!$KeyValues) {
        echo "!!! Values cannot be empty";
        exit 1;
    }

    $document = [System.Xml.XmlDocument]::new()
    $document.PreserveWhitespace = $true
    $document.Load((Resolve-Path $Path))
    $namespaceManager=[System.Xml.XmlNamespaceManager]::new($document.NameTable)

    if ($printFile) 
    {
        echo "Original file: `n $(Get-Content $Path)";
    }

    foreach ($keyValue in $KeyValues) {
        $key = $keyValue[0]
        $value = $keyValue[1]

        $xpath = "//resources/string[@name='$key']";
        $document.SelectSingleNode($xpath, $namespaceManager).InnerText = $value;

    }

    $document.Save((Resolve-Path $Path));
    if ($printFile) 
    {
        echo "Modified file: `n $(Get-Content $Path)";
    }
}

function Update-ActivityName {
    param (
        [string]$Path,
        [string]$OldActivityName,
        [string]$NewActivityName
    )
    
    if (!$Path) {
        echo "!!! Path cannot be empty";
        exit 1;
    }

    if (!$OldActivityName) {
        echo "!!! OldActivityName cannot be empty";
        exit 1;
    }

    if (!$NewActivityName) {
        echo "!!! NewActivityName cannot be empty";
        exit 1;
    }



    (Get-Content (Resolve-Path $Path)).Replace("Label = ""$OldActivityName""","Label = ""$NewActivityName""") | Set-Content (Resolve-Path $Path)
}