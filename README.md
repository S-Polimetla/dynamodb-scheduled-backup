# dynamodb-scheduled-backup
- Microservice based on lambda to create and delete dynamodb backups with a given schedule

The cron expression used is `cron(0 12 ? * SUN *)`. The functions create and delete backup run every sunday at noon. 

In my example, the following has been configured
- Creation and Deletion of old backups happen every sunday at noon
- A backup is considered old if it was created 7 days ago at the time, the lambda function to delete runs. 

The deployment is done using GitHub Actions using OpenID Connect (OIDC) approach. The role creation file is [here](https://gist.github.com/S-Polimetla/11a38913ab914d1e6b023365b8b22159)
Deployment only happens when a push to the main branch happens
There are 2 workflows. [Deploy](./.github/workflows/deploy.yml) happens only when something is pushed to main branch. 
- Pushes to other branches and PRs are being addressed by [Build](./.github/workflows/build.yml)

A detailed description about the implementation is covered in my post [here](link-here)