# line-realtime-chat-api
Line OA Real-time Chat Back-end (API)
## Requirements
- Node.js 18 or higher
- Docker 
## Quick Start
### Install Project
``` bash
$ npm install
```
### Start Project
- ฺBuild DockerFile
``` bash
$ docker-compose build
```
- Run project
``` bash
$ docker-compose up -d
```
  - Test
    - You havet run front-end on locally => ([line-realtime-chat-web](https://github.com/Much-Arisz/line-realtime-chat-web))
    - Test user type "Admin" => http://localhost:3000/admin/login or http://drum-star-stud.ngrok-free.app/admin/login
    - Test user type "User"
       - Add Line OA => ID: @838qvqkc or QRCODE
       - ![image](https://github.com/Much-Arisz/line-realtime-chat-web/assets/56961503/3407b73b-247b-4472-b0f3-49936801da0b)
