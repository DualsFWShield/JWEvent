@echo off
setlocal enabledelayedexpansion

echo const GALLERY_IMAGES = [ > js/gallery_list.js

for %%f in (gallery\*) do (
    echo "%%~nxf", >> js/gallery_list.js
)

echo ]; >> js/gallery_list.js

echo Gallery list updated in js/gallery_list.js!
pause
