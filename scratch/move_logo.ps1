$src = "C:\Users\Pongo\.gemini\antigravity\brain\8ff73f30-b1a8-4c2e-bf62-93380e7406eb\cuanflix_logo_og_final_1778655177517.png"
$dst = "d:\folder_coding\cuanflix\cuanflix\public\og-image-final.png"
if (Test-Path $src) {
    Copy-Item $src $dst -Force
    Write-Host "SUCCESS: Logo has been moved to public folder."
} else {
    Write-Host "ERROR: Source file not found."
}
