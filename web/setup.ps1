# Run from: automate blog\web
# Usage: .\setup.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "==> Installing dependencies..." -ForegroundColor Cyan
npm install

if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  Write-Host "==> Created .env from .env.example — edit DATABASE_URL before continuing!" -ForegroundColor Yellow
}

Write-Host "==> Pushing database schema..." -ForegroundColor Cyan
npx prisma db push

Write-Host "==> Seeding database..." -ForegroundColor Cyan
npm run db:seed

Write-Host ""
Write-Host "Done! Start the site with: npm run dev" -ForegroundColor Green
Write-Host "Admin: http://localhost:3000/admin/login" -ForegroundColor Green
Write-Host "Login: admin@insightpress.com / ChangeMe123!" -ForegroundColor Green
