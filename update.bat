@ECHO OFF
rmdir /s /q node_modules
mkdir logs
call npm install
call npm install supervisor -g
