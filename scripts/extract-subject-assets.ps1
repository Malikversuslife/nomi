Add-Type -AssemblyName System.Drawing

# Re-extract the four approved subject illustrations from the supplied sheet so
# each ships as a standalone transparent production PNG.
#
# The source PNG already carries a real alpha channel with transparency around
# each illustration. The previous extraction synthesised alpha from luminance,
# which left a dark haze under the art. This pass:
#   1. trusts the source alpha channel,
#   2. drops residual background pixels (RGB junk under / near alpha 0),
#   3. un-premultiplies anti-aliased edge colours against the near-black matte
#      so no dark fringe survives on light surfaces,
#   4. normalises all four onto identically sized canvases with equal padding.

$sourcePath = Join-Path $PSScriptRoot "..\public\Subject 3D Icons.png"
$outputDirectory = Join-Path $PSScriptRoot "..\public\brand\nomi\subjects"

# Icon search regions in source-sheet coordinates (generous margins; gutters
# between the four illustrations are fully transparent in the source).
$icons = @(
  @{ Name = "mathematics"; X0 = 120; Y0 = 40;  X1 = 710; Y1 = 500 },
  @{ Name = "physics";     X0 = 810; Y0 = 50;  X1 = 1400; Y1 = 490 },
  @{ Name = "chemistry";   X0 = 180; Y0 = 500; X1 = 770; Y1 = 980 },
  @{ Name = "biology";     X0 = 810; Y0 = 480; X1 = 1410; Y1 = 980 }
)

# Drop pixels that are fictional background residue rather than illustration:
# low alpha AND near-black. Legitimate internal shadows carry high alpha.
$ResidueAlphaMax = 110
$ResidueMaxColor = 64

# Normalisation targets: unify visual scale by longest side, then place every
# illustration on the same canvas with identical surrounding padding.
$TargetLongSide = 1000
$Padding = 150

function Get-ContentBounds {
  param([System.Drawing.Bitmap]$Bitmap, [int]$MinAlpha)
  $minX = $Bitmap.Width; $minY = $Bitmap.Height; $maxX = -1; $maxY = -1
  for ($y = 0; $y -lt $Bitmap.Height; $y++) {
    for ($x = 0; $x -lt $Bitmap.Width; $x++) {
      if ($Bitmap.GetPixel($x, $y).A -ge $MinAlpha) {
        if ($x -lt $minX) { $minX = $x }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  return [pscustomobject]@{ X = $minX; Y = $minY; Width = $maxX - $minX + 1; Height = $maxY - $minY + 1 }
}

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$source = [System.Drawing.Bitmap]::FromFile($sourcePath)

$cleaned = @()

try {
  foreach ($icon in $icons) {
    # 1. Tight content bounds inside the region (alpha >= 128).
    $region = New-Object System.Drawing.Bitmap(
      ($icon.X1 - $icon.X0 + 1),
      ($icon.Y1 - $icon.Y0 + 1),
      [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      for ($y = 0; $y -lt $region.Height; $y++) {
        for ($x = 0; $x -lt $region.Width; $x++) {
          $region.SetPixel($x, $y, $source.GetPixel($icon.X0 + $x, $icon.Y0 + $y))
        }
      }
    } catch { throw }

    $bounds = Get-ContentBounds -Bitmap $region -MinAlpha 128
    $m = 12
    $cropX = [Math]::Max(0, $bounds.X - $m)
    $cropY = [Math]::Max(0, $bounds.Y - $m)
    $cropW = [Math]::Min($region.Width - $cropX, $bounds.Width + $m * 2)
    $cropH = [Math]::Min($region.Height - $cropY, $bounds.Height + $m * 2)

    # 2. Clean the crop: honour source alpha, drop residue, un-premultiply edges.
    $clean = New-Object System.Drawing.Bitmap(
      $cropW,
      $cropH,
      [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      for ($y = 0; $y -lt $cropH; $y++) {
        for ($x = 0; $x -lt $cropW; $x++) {
          $pixel = $region.GetPixel($cropX + $x, $cropY + $y)
          $a = $pixel.A
          $maxComponent = [Math]::Max($pixel.R, [Math]::Max($pixel.G, $pixel.B))

          if ($a -lt 24 -or ($a -lt $ResidueAlphaMax -and $maxComponent -lt $ResidueMaxColor)) {
            $clean.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            continue
          }

          if ($a -lt 255) {
            # Straight-alpha recovery against the near-black source matte.
            $r = [Math]::Min(255, [int]([Math]::Round($pixel.R * 255.0 / $a)))
            $g = [Math]::Min(255, [int]([Math]::Round($pixel.G * 255.0 / $a)))
            $b = [Math]::Min(255, [int]([Math]::Round($pixel.B * 255.0 / $a)))
            $clean.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($a, $r, $g, $b))
            continue
          }

          $clean.SetPixel($x, $y, $pixel)
        }
      }
    } catch { throw }

    $cleaned += [pscustomobject]@{ Name = $icon.Name; Bitmap = $clean }
    $region.Dispose()
  }

  # 3. Normalise: uniform scale + identical canvases + equal padding.
  $scaledBounds = @()
  foreach ($entry in $cleaned) {
    $b = Get-ContentBounds -Bitmap $entry.Bitmap -MinAlpha 24
    $long = [Math]::Max($b.Width, $b.Height)
    $scale = $TargetLongSide / [double]$long
    $scaledBounds += [pscustomobject]@{
      Name = $entry.Name
      Bitmap = $entry.Bitmap
      Width = [int][Math]::Round($b.Width * $scale)
      Height = [int][Math]::Round($b.Height * $scale)
    }
  }

  $canvasWidth = $Padding * 2 + ($scaledBounds | Measure-Object -Property Width -Maximum).Maximum
  $canvasHeight = $Padding * 2 + ($scaledBounds | Measure-Object -Property Height -Maximum).Maximum

  foreach ($entry in $scaledBounds) {
    $canvas = New-Object System.Drawing.Bitmap(
      $canvasWidth,
      $canvasHeight,
      [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($canvas)
      try {
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $destX = [int][Math]::Round(($canvasWidth - $entry.Width) / 2.0)
        $destY = [int][Math]::Round(($canvasHeight - $entry.Height) / 2.0)
        $graphics.DrawImage($entry.Bitmap, $destX, $destY, $entry.Width, $entry.Height)
      } finally {
        $graphics.Dispose()
      }
      # Post-pass: bin the faintest interpolation fringe so nothing but the
      # illustration silhouette is visible on any surface.
      for ($y = 0; $y -lt $canvasHeight; $y++) {
        for ($x = 0; $x -lt $canvasWidth; $x++) {
          $p = $canvas.GetPixel($x, $y)
          if ($p.A -gt 0 -and $p.A -lt 18) {
            $canvas.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
          }
        }
      }

      $outputPath = Join-Path $outputDirectory "$($entry.Name).png"
      $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
      Write-Output ("Saved {0} ({1}x{2}, art {3}x{4})" -f $outputPath, $canvasWidth, $canvasHeight, $entry.Width, $entry.Height)
    } finally {
      $canvas.Dispose()
    }
  }
} finally {
  foreach ($entry in $cleaned) { $entry.Bitmap.Dispose() }
  $source.Dispose()
}