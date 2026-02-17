@echo off

echo ========================
echo Deploying LMS Backend
echo ========================

echo.
echo Adding changes...
git add .

echo.
echo Committing...
git commit -m "auto deploy"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo Running deployment on server...
ssh zalgo@68.178.175.15 "cd /var/www/lmsadmin.zalgoedutech.com/lms_backend && ./deploy.sh"

echo.
echo ========================
echo Deployment Finished
echo ========================

pause
