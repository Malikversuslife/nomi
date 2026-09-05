Add-Type -AssemblyName System.Drawing

$root = Join-Path $PSScriptRoot ".."
$logoPath = Join-Path $root "public\brand\nomi\logo.png"
$lockupPath = Join-Path $root "public\brand\nomi\lockup-primary.png"
$mascotPath = Join-Path $root "public\brand\nomi\mascot\encouraging.png"
$iconDirectory = Join-Path $root "public\icons"
$socialDirectory = Join-Path $root "public\brand\nomi\social"

New-Item -ItemType Directory -Force -Path $iconDirectory, $socialDirectory | Out-Null

function New-Graphics([System.Drawing.Bitmap]$bitmap) {
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  return $graphics
}

function Save-Icon(
  [System.Drawing.Image]$source,
  [System.Drawing.Rectangle]$crop,
  [int]$size,
  [string]$path
) {
  $canvas = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $graphics = New-Graphics $canvas
    try {
      $graphics.DrawImage($source, (New-Object System.Drawing.Rectangle(0, 0, $size, $size)), $crop, [System.Drawing.GraphicsUnit]::Pixel)
    } finally {
      $graphics.Dispose()
    }
    $canvas.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $canvas.Dispose()
  }
}

function Save-MaskableIcon(
  [System.Drawing.Image]$source,
  [System.Drawing.Rectangle]$crop,
  [string]$path
) {
  $canvas = New-Object System.Drawing.Bitmap(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $graphics = New-Graphics $canvas
    try {
      $graphics.Clear([System.Drawing.Color]::FromArgb(255, 108, 60, 255))
      # A 20% inset keeps the compact mark inside maskable safe areas.
      $graphics.DrawImage($source, (New-Object System.Drawing.Rectangle(102, 102, 308, 308)), $crop, [System.Drawing.GraphicsUnit]::Pixel)
    } finally {
      $graphics.Dispose()
    }
    $canvas.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $canvas.Dispose()
  }
}

$logo = [System.Drawing.Bitmap]::FromFile($logoPath)
$lockup = [System.Drawing.Bitmap]::FromFile($lockupPath)
$mascot = [System.Drawing.Bitmap]::FromFile($mascotPath)

try {
  $side = [Math]::Min($logo.Width, $logo.Height)
  $crop = New-Object System.Drawing.Rectangle([int](($logo.Width - $side) / 2), [int](($logo.Height - $side) / 2), $side, $side)

  foreach ($size in 16, 32, 48, 180, 192, 512) {
    $name = if ($size -eq 180) { "apple-touch-icon.png" } else { "icon-$size.png" }
    Save-Icon -source $logo -crop $crop -size $size -path (Join-Path $iconDirectory $name)
  }
  Save-MaskableIcon -source $logo -crop $crop -path (Join-Path $iconDirectory "maskable-icon-512.png")

  $preview = New-Object System.Drawing.Bitmap(1200, 630, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  try {
    $graphics = New-Graphics $preview
    try {
      $graphics.Clear([System.Drawing.Color]::FromArgb(255, 255, 249, 242))
      $purpleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 108, 60, 255))
      try {
        $graphics.FillRectangle($purpleBrush, 800, 0, 400, 630)
      } finally {
        $purpleBrush.Dispose()
      }
      # The primary lockup retains the approved “Learns how you learn.” proposition.
      $graphics.DrawImage($lockup, 110, 155, 430, 320)
      $graphics.DrawImage($mascot, 840, 158, 320, 294)
    } finally {
      $graphics.Dispose()
    }
    $preview.Save((Join-Path $socialDirectory "nomi-site-preview.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $preview.Dispose()
  }
} finally {
  $logo.Dispose()
  $lockup.Dispose()
  $mascot.Dispose()
}
