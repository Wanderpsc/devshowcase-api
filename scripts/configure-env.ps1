$securePassword = Read-Host 'Senha do usuario postgres' -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

try {
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    $encodedPassword = [Uri]::EscapeDataString($plainPassword)
    $content = @(
        'PORT=3000'
        "DATABASE_URL=postgresql://postgres:$encodedPassword@localhost:5432/devshowcase"
    )
    Set-Content -Path '.env' -Value $content -Encoding ascii
    Write-Output '.env configurado com sucesso.'
}
finally {
    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
    $plainPassword = $null
    $securePassword.Dispose()
}