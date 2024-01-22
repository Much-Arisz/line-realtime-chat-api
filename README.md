# line-realtime-chat-api
Line OA Real-time Chat Back-end (API)
## Requirements
- Node.js 18 or higher
- Docker (optional)
- NGROK (if run on local)
## Quick Start
- Install Project
``` bash
$ npm install
```
- Start Project
1. Locally
   - Run project
``` bash
$ npm run start
```
  - Run Ngrok for create public url (Line webhook)
``` bash
$ ngrok http --authtoken=2b0OIkBqW6wgDWiwC7I4BfL5Mln_5RKrtWGY3qJPd65XAoL6w--domainname=sculpin-busy-raptor.ngrok-free.app 3002
```
  - Test
    - You havet run front-end on locally => ([line-realtime-chat-web](https://github.com/Much-Arisz/line-realtime-chat-web))
    - Test user type "Admin" => http://localhost:3000/admin/login
    - Test user type "User"
       - Add Line OA => ID: @838qvqkc or QRCODE
       - ![image](https://github.com/Much-Arisz/line-realtime-chat-web/assets/56961503/3407b73b-247b-4472-b0f3-49936801da0b)
       - If you want to register or login, you have to copy & paste URL on locally website, then change URL from https://drum-star-stud.ngrok-free.app to http://localhost:3000
2. Docker
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
