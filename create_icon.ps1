
Add-Type -AssemblyName System.Drawing

$width = 128
$height = 128
$bmp = New-Object System.Drawing.Bitmap $width, $height
$g = [System.Drawing.Graphics]::FromImage($bmp)

# Background: Dark (Slate-900 like)
$bg = [System.Drawing.Color]::FromArgb(15, 23, 42) 
$g.Clear($bg)

# Draw Border: Neon Green
$green = [System.Drawing.Color]::FromArgb(74, 222, 128)
$pen = New-Object System.Drawing.Pen $green, 6
$g.DrawRectangle($pen, 3, 3, $width-6, $height-6)

# Text: "M"
$fontFamily = "Arial"
$fontSize = 70
$fontStyle = [System.Drawing.FontStyle]::Bold
$font = New-Object System.Drawing.Font $fontFamily, $fontSize, $fontStyle

$brush = New-Object System.Drawing.SolidBrush $green
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center

$g.DrawString("M", $font, $brush, $width/2, $height/2 + 5, $format)

$path = "$PSScriptRoot\icon.png"
$bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()

Write-Host "Icon created at $path"
