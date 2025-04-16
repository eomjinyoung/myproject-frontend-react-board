# myproject-frontend-react-board

## 공통 모듈 가져오기

### git 저장소를 처음 clone 했을 때

다음을 실행하여 공통 모듈을 가져온다.

```bash
git submodule update --init --recursive
```

### git 저장소를 가져온 후

공통 모듈을 최신 버전으로 갱신한다.

```bash
git submodule update --remote
```

## 설정

### `.env.local`, `env.production` 파일

`.env.local` : 로컬에서 개발할 때 사용하는 환경 변수

```properties
# Backend Server
NEXT_PUBLIC_AUTH_REST_API_URL=http://localhost:8010
NEXT_PUBLIC_BOARD_REST_API_URL=http://localhost:8020

# Frontend Server
NEXT_PUBLIC_AUTH_UI_URL=http://localhost:3010
NEXT_PUBLIC_BOARD_UI_URL=http://localhost:3020
```

`.env.production` : 서버에 배포할 때 사용하는 환경 변수

```properties
# Backend Server
NEXT_PUBLIC_AUTH_REST_API_URL=http://110.165.18.171:8010
NEXT_PUBLIC_BOARD_REST_API_URL=http://110.165.18.171:8020

# Frontend Server
NEXT_PUBLIC_AUTH_UI_URL=http://110.165.18.171:3010
NEXT_PUBLIC_BOARD_UI_URL=http://110.165.18.171:3020
```

`NEXT_PUBLIC_` 접두사를 붙여야 웹브라우저에서 접근 가능

#### 환경변수 사용

```js
fetch(`${NEXT_PUBLIC_AUTH_REST_API_URL}/auth/login`, ...)
```

#### next.js 에서 `.env` 파일을 읽는 순서

1. `.env.local` : 로컬 개발 환경 전용(git에서 제외)
2. `.env.development` : 개발 환경
3. `.env.production` : 배포 환경
4. `.env` : 모든 환경(기본 값)

## 모듈 설치

```bash
npm install
```

## 도커 이미지 생성

### `.dockerignore`

Docker 빌드 시 포함하지 않을 파일/디렉터리를 지정.

- 이미지 크기 줄이기
  - 불필요한 파일은 빌드 컨텍스트에서 제외되니까 최종 이미지가 가벼워짐.
- 빌드 속도 향상
  - Docker는 .dockerignore에 포함된 파일은 전송하지 않아서 복사 속도 빨라짐.
- 보안 강화
  - .env.local, 인증 키, 개발용 설정파일 등이 이미지에 포함되지 않게 막을 수 있음.

```
node_modules
.env
.env.local
Dockerfile
.dockerignore
.git
.gitignore
*.log
```

### `Dockerfile`

```
FROM node:lts

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3010

CMD ["npm", "run", "start"]
```

### 이미지 생성

```bash
docker build -t myproject-frontend-board .
```

## 도커 컨테이너 실행

```bash
docker run -d -p 3010:3010 --name board-ui myproject-frontend-board
```

### 실행 상태 확인 - 로그 보기

- 백그라운드로 실행했을 경우, 로그 보기

```bash
docker logs board-ui
```

- 최근 100줄만 먼저 보고, 이후부터는 실시간으로 이어서 출력하기

```bash
docker logs -f --tail 100 board-ui
```
