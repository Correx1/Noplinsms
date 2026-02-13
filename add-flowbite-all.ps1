# Add Flowbite CDN to all HTML files
$flowbiteScript = '<script src="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.js"></script>'

# Find all HTML files
$htmlFiles = Get-ChildItem -Path . -Filter *.html -Recurse | Where-Object { 
    $_.FullName -notmatch 'node_modules' -and 
    $_.FullName -notmatch 'dist' 
}

$addedCount = 0
$skippedCount = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if Flowbite script is already present
    if ($content -match 'flowbite') {
        Write-Host "Skip: $($file.Name)" -ForegroundColor Yellow
        $skippedCount++
        continue
    }
    
    # Check if file has </body> tag
    if ($content -notmatch '</body>') {
        Write-Host "No body: $($file.Name)" -ForegroundColor Gray
        $skippedCount++
        continue
    }
    
    # Add Flowbite script before </body> tag
    $newContent = $content -replace '</body>', "    $flowbiteScript`r`n</body>"
    
    Set-Content -Path $file.FullName -Value $newContent -NoNewline
    Write-Host "Added: $($file.Name)" -ForegroundColor Green
    $addedCount++
}

Write-Host "`nAdded to $addedCount files, skipped $skippedCount files"
