Set oShell = CreateObject("WScript.Shell")
oShell.Run "cmd /c ""D:\ONGC RAM proj\VERIFY_ALL.bat"" > ""D:\ONGC RAM proj\verify_result.txt"" 2>&1", 0, True
MsgBox "Verification complete! Check verify_result.txt", vbInformation, "Done"
