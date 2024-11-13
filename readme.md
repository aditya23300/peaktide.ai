<------------------------------------about project----------------------------------------------------------------------------->

1. name of the project is "peaktide.ai"

<---------------file structure of this project-------------------------------------------------------------------------------->

1. readme.md is not needed in either of frontend deployment or backend deployment, its just for maintaining the starter/info about the project on github, so it will be kept outside of frontend or backend folder.
2. all the files related to github like git,gitignore are used for managing the overall project repo on the github , so they have no role in the deployment so we keep them in root directory and out of the frontend and backend folders.

<-----------------------notes-------------------------------------------------------------------------------------------------->
for WhatsApp notification : WhatsApp cloud api (provided by meta for business)

5. why python for WhatsApp is not possible?
   python automation for WhatsApp: can only handle 1 conversation per whatsapp account at any instant ,,if it detects>1 conversation at any instant then it will detect that bot is being used and will block the number from WhatsApp forever and also file a legal suite.

<----------------------------work-flow for updating the codebase on github----------------------------------------------------->
Whenever you make changes to your project, you can follow this general workflow to update your GitHub repository:

step-1: Check the Status:
Before staging changes, check the status of your repository:
command: git status

step-2: Stage any modified or new files for commit:
command: git add .
You can stage specific files by replacing . with the file names.

step-3: Commit Changes:
Commit your changes with a descriptive message:
command: git commit -m "Your descriptive message about changes"

step-4: Push Changes to GitHub:
Push your committed changes to the remote repository:
command: git push origin master

step-5: you are done,,,just check the status using git status command


in short,
git status
git add .
git commit -m "your message"
git push origin your_branch_name
