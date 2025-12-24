@echo off
chcp 65001 >nul
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 请右键此文件，选择"以管理员身份运行"
    pause
    exit /b 1
)

echo ========================================
echo   启用 Windows 长路径支持
echo ========================================
echo.

reg add "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f

if %errorLevel% equ 0 (
    echo.
    echo [成功] 长路径支持已启用！
    echo.
    echo 请重启电脑使设置生效。
    echo 重启后在 app\android 目录运行: ./gradlew assembleRelease
    echo.
) else (
    echo.
    echo [失败] 注册表修改失败，请检查权限。
)

pause
