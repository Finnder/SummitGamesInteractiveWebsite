# Tiny static file server for local preview (no Python/Node needed).
# Run:  powershell -ExecutionPolicy Bypass -File serve.ps1
# Then open http://localhost:8137/
param([int]$Port = 8137)

$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/  (Ctrl+C to stop)"

$mime = @{
  ".html" = "text/html"; ".css" = "text/css"; ".js" = "text/javascript"
  ".json" = "application/json"; ".md" = "text/markdown; charset=utf-8"
  ".png" = "image/png"; ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"
  ".gif" = "image/gif"; ".svg" = "image/svg+xml"; ".ico" = "image/x-icon"
  ".webp" = "image/webp"; ".woff2" = "font/woff2"
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  try {
    $path = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    if ($path.EndsWith("/")) { $path = $path + "index.html" }
    $full = [System.IO.Path]::GetFullPath((Join-Path $root $path.TrimStart("/")))
    if ($full.StartsWith($root) -and (Test-Path -LiteralPath $full -PathType Leaf)) {
      $bytes = [System.IO.File]::ReadAllBytes($full)
      $ext = [System.IO.Path]::GetExtension($full).ToLower()
      if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] }
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
    }
  } catch {
    try { $ctx.Response.StatusCode = 500 } catch {}
  }
  $ctx.Response.Close()
}
