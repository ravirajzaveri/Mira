#!/usr/bin/env python3
import os
import subprocess
import sys

def try_extract_with_windows_tools(rar_path, output_dir):
    """Try to use Windows tools through WSL"""
    # Check if we're in WSL
    if os.path.exists('/mnt/c'):
        print(f"Attempting to extract {rar_path} using Windows tools...")
        
        # Convert WSL path to Windows path
        windows_path = rar_path.replace('/mnt/c/', 'C:\\').replace('/', '\\')
        
        # Try using Windows' built-in tar command (supports some RAR files)
        try:
            cmd = f'cmd.exe /c "tar -xf \"{windows_path}\" -C \"{output_dir}\""'
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            if result.returncode == 0:
                print("Successfully extracted using Windows tar")
                return True
            else:
                print(f"Windows tar failed: {result.stderr}")
        except Exception as e:
            print(f"Error using Windows tar: {e}")
        
        # Check if WinRAR is installed
        winrar_paths = [
            "C:\\Program Files\\WinRAR\\WinRAR.exe",
            "C:\\Program Files (x86)\\WinRAR\\WinRAR.exe"
        ]
        
        for winrar in winrar_paths:
            if subprocess.run(f'cmd.exe /c "if exist \"{winrar}\" echo found"', 
                            shell=True, capture_output=True, text=True).stdout.strip() == "found":
                print(f"Found WinRAR at {winrar}")
                cmd = f'cmd.exe /c "\"{winrar}\" x -y \"{windows_path}\" \"{output_dir}\""'
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                if result.returncode == 0:
                    print("Successfully extracted using WinRAR")
                    return True
    
    return False

def main():
    rar_files = [
        "/mnt/c/Users/Raviraj D. Zaveri/Desktop/Esatto-Factory/Debug.rar",
        "/mnt/c/Users/Raviraj D. Zaveri/Desktop/Esatto-Factory/Esatto-Factory.rar"
    ]
    
    for rar_file in rar_files:
        if os.path.exists(rar_file):
            output_dir = os.path.join("/home/raviraj/Mira", 
                                    os.path.basename(rar_file).replace('.rar', '_extracted'))
            os.makedirs(output_dir, exist_ok=True)
            
            if try_extract_with_windows_tools(rar_file, output_dir):
                print(f"✓ Extracted {rar_file} to {output_dir}")
            else:
                print(f"✗ Failed to extract {rar_file}")
                print("Please install WinRAR or 7-Zip on Windows to extract these files")
        else:
            print(f"File not found: {rar_file}")

if __name__ == "__main__":
    main()