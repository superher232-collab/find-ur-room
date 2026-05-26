$ImagePath = "c:\choirul\find ur room\public\maps\lantai2.png"
$OutPath = "c:\choirul\find ur room\ocr_result.txt"

try {
    [void][Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime]
    [void][Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
    [void][Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType=WindowsRuntime]
} catch {
    "Failed to load WinRT classes." | Out-File $OutPath
    exit 1
}

$asyncOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($ImagePath)
while (-not $asyncOp.IsCompleted) { Start-Sleep -Milliseconds 50 }
$storageFile = $asyncOp.GetResults()

$asyncOp2 = $storageFile.OpenAsync([Windows.Storage.FileAccessMode]::Read)
while (-not $asyncOp2.IsCompleted) { Start-Sleep -Milliseconds 50 }
$randomAccessStream = $asyncOp2.GetResults()

$asyncOp3 = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($randomAccessStream)
while (-not $asyncOp3.IsCompleted) { Start-Sleep -Milliseconds 50 }
$decoder = $asyncOp3.GetResults()

$asyncOp4 = $decoder.GetSoftwareBitmapAsync()
while (-not $asyncOp4.IsCompleted) { Start-Sleep -Milliseconds 50 }
$softwareBitmap = $asyncOp4.GetResults()

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if ($null -eq $engine) {
    "OCR Engine could not be created." | Out-File $OutPath
    exit 1
}

$asyncOp5 = $engine.RecognizeAsync($softwareBitmap)
while (-not $asyncOp5.IsCompleted) { Start-Sleep -Milliseconds 50 }
$ocrResult = $asyncOp5.GetResults()

$out = @()
foreach ($line in $ocrResult.Lines) {
    $rect = $line.Words[0].BoundingRect
    $out += "LINE: $($line.Text) [X: $($rect.X), Y: $($rect.Y)]"
}

$out | Out-File $OutPath -Force
"DONE" | Out-File "c:\choirul\find ur room\ocr_done.txt" -Force
