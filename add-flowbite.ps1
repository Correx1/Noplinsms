# Add Flowbite CDN to all HTML files that need it
$htmlFiles = @(
    "index.html",
    "login-staff.html", 
    "login-student-parent.html",
    "password-recovery.html"
)

foreach ($file in $htmlFiles) {
    $content = Get-Content $file -Raw
    
    # Check if Flowbite script is already present
    if ($content -notmatch "flowbite") {
        # Add Flowbite script before closing </body> tag
        $content = $content -replace '</body>', '    <script src="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.js"></script>
</body>'
        
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "✓ Added Flowbite to $file"
    }
    else {
        Write-Host "⊘ Flowbite already in $file"
    }
}

Write-Host "`nDone!"
