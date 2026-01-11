# Script to update gallery.json with images from assets/gallery
$galleryPath = Join-Path $PSScriptRoot "assets\gallery"
$jsonPath = Join-Path $PSScriptRoot "assets\gallery.json"

# Check if gallery folder exists
if (!(Test-Path $galleryPath)) {
    Write-Host "Creating assets/gallery folder..."
    New-Item -ItemType Directory -Force -Path $galleryPath
}

# Get all image files (jpg, jpeg, png, gif, webp)
$images = Get-ChildItem -Path $galleryPath -Include *.jpg, *.jpeg, *.png, *.gif, *.webp -Recurse

# Create JSON array
# We use a strictly typed ArrayList or force @() to ensure ConvertTo-Json treats it as a list
$jsonContent = @()

if ($images) {
    foreach ($img in $images) {
        # Get relative path using forward slashes for web
        $relativePath = "assets/gallery/" + $img.Name
        $jsonContent += $relativePath
    }
}

# Convert to JSON and save
# IMPORTANT: Use -InputObject to prevent PowerShell from unrolling a single-item array into a string
# We envelop in @() one last time to be sure
$jsonString = ConvertTo-Json -InputObject @($jsonContent) -Compress

$jsonString | Set-Content $jsonPath -Encoding UTF8

Write-Host "Gallery updated! Found $($jsonContent.Count) images."
