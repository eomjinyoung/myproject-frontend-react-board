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

EXPOSE 3020

CMD ["npm", "run", "start"]
```

### 이미지 생성

```bash
docker build -t myproject-frontend-board .
```

## 도커 컨테이너 실행

```bash
docker run -d -p 3020:3020 --name board-ui myproject-frontend-board
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

## NCP - Container Registry 사용하기

### 로그인 하기

```bash
$ sudo docker login k8s-edu-camp71.kr.ncr.ntruss.com
Username: Access Key ID
Password: Secret Key
```

### 이미지에 태깅하기

```bash
$ sudo docker tag local-image:tagname new-repo:tagname
$ sudo docker tag myproject-frontend-board k8s-edu-camp71.kr.ncr.ntruss.com/myproject-frontend-board
```

#### 저장소에 이미지 올리기

```bash
$ sudo docker push k8s-edu-camp71.kr.ncr.ntruss.com/<TARGET_IMAGE[:TAG]>
$ sudo docker push k8s-edu-camp71.kr.ncr.ntruss.com/myproject-frontend-board
```

## NCP - Ncloud Kubernetes Service 사용하기

### 쿠버네티스가 관리할 리소스 정의: 매니페스트 파일(Kubernetes manifest file) 작성

#### deployment + service 타입 리소스 정의 : `board_ui-deployment.yml`

- kind: Deployment
  - 애플리케이션의 "실행 상태(pod)"를 정의하고 관리하는 리소스
  - 원하는 개수의 Pod 복제본(replica)을 유지
  - 애플리케이션의 롤링 업데이트 및 롤백 지원
  - Pod가 죽으면 자동으로 재생성
- kind: Service
  - Pod 집합에 접근할 수 있는 네트워크 인터페이스를 제공하는 리소스
  - Pod의 IP가 바뀌어도 고정된 접근 지점(ClusterIP, LoadBalancer 등)을 제공
  - 내부에서 접근하거나 외부로 노출하거나 가능
  - Deployment로 생성된 Pod들을 라벨로 선택해서 연결해줌

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: board_ui
spec:
  replicas: 1
  selector:
    matchLabels:
      app: board_ui
  template:
    metadata:
      labels:
        app: board_ui
    spec:
      restartPolicy: Always
      imagePullSecrets:
        - name: regcred
      containers:
        - name: board_ui
          image: lo20hyy7.kr.private-ncr.ntruss.com/myproject-frontend-board
          ports:
            - containerPort: 3020
---
apiVersion: v1
kind: Service
metadata:
  name: board_ui-service
  labels:
    app: board_ui
spec:
  selector:
    app: board_ui
  ports:
    - protocol: TCP
      port: 3020
      targetPort: 3020
  type: LoadBalancer
```

도커 이미지를 지정할 때 Private Endpoint 를 사용하면, 내부 통신으로 다뤄진다.

### 리소스 생성

#### Deployment + Service 리소스 생성

```bash
kubectl2 apply -f board_ui-deployment.yml
```

#### 생성된 리소스 확인

```bash
kubectl2 get deployments
kubectl2 get svc
```
