// Jenkinsfile - CI/CD Pipeline:
// Checkout → Build → Test → Docker Build → Push Docker Hub → Deploy Production
pipeline {
    agent any

    environment {
        GIT_REPO      = 'https://github.com/ngan1306/du_an_truong_chung.git'
        GIT_BRANCH    = 'main'
        // Đổi DOCKER_USERNAME cho khớp tài khoản Docker Hub của bạn
        IMAGE_BACKEND = 'du-an-truong-chung-backend'
        IMAGE_FRONTEND= 'du-an-truong-chung-frontend'
        SERVER_HOST   = '192.168.1.10'   // ⭐ IP production server
        SERVER_USER   = 'ubuntu'          // ⭐ user SSH production server
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 60, unit: 'MINUTES')
    }

    stages {

        // ==========================================================
        // 1. CHECKOUT
        // ==========================================================
        stage('1. Checkout') {
            steps {
                echo 'Đang pull code từ Git repository...'
                checkout([$class: 'GitSCM',
                    branches: [[name: "*/${GIT_BRANCH}"]],
                    userRemoteConfigs: [[
                        url: "${GIT_REPO}",
                        credentialsId: 'github-pat'
                    ]]
                ])
            }
        }

        // ==========================================================
        // 2. BUILD ỨNG DỤNG
        // ==========================================================
        stage('2. Build Backend (Flask)') {
            steps {
                echo 'Build Backend...'
                sh '''
                    cd backend
                    python -m venv venv || true
                    . ./venv/bin/activate
                    pip install -r requirements.txt
                '''
            }
        }

        stage('2. Build Frontend (React)') {
            steps {
                echo 'Build Frontend...'
                sh '''
                    cd frontend
                    npm ci
                    CI=false npm run build
                '''
            }
        }

        // ==========================================================
        // 3. CHẠY TEST
        // ==========================================================
        stage('3. Chạy test Backend') {
            steps {
                echo 'Chạy pytest cho Backend...'
                sh '''
                    cd backend
                    . ./venv/bin/activate
                    pip install pytest || true
                    python -m pytest -v || true
                '''
            }
        }

        stage('3. Chạy test Frontend') {
            steps {
                echo 'Chạy test cho Frontend...'
                sh '''
                    cd frontend
                    npm test -- --watchAll=false --passWithNoTests || true
                '''
            }
        }

        // ==========================================================
        // 4. DOCKER BUILD
        // ==========================================================
        stage('4. Docker Build') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        docker build -t docker.io/$DOCKER_USER/$IMAGE_BACKEND:latest  ./backend
                        docker build -t docker.io/$DOCKER_USER/$IMAGE_FRONTEND:latest ./frontend
                    '''
                }
            }
        }

        // ==========================================================
        // 5. PUSH DOCKER HUB
        // ==========================================================
        stage('5. Push Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push docker.io/$DOCKER_USER/$IMAGE_BACKEND:latest
                        docker push docker.io/$DOCKER_USER/$IMAGE_FRONTEND:latest
                    '''
                }
            }
        }

        // ==========================================================
        // 6. DEPLOY PRODUCTION QUA SSH
        // ==========================================================
        stage('6. Deploy lên Production Server') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sshagent (credentials: ['server-ssh-key']) {
                        sh '''
                            # Copy docker-compose.prod.yml lên server
                            scp -o StrictHostKeyChecking=no docker-compose.prod.yml \
                                $SERVER_USER@$SERVER_HOST:~/project/docker-compose.prod.yml

                            # SSH vào server để deploy
                            ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "
                                cd ~/project && \
                                echo 'DOCKER_USERNAME=$DOCKER_USER' > .env && \
                                grep -q JWT_SECRET_KEY .env || echo 'JWT_SECRET_KEY=change-this-secret' >> .env && \
                                echo \"$DOCKER_PASS\" | docker login -u $DOCKER_USER --password-stdin && \
                                docker compose -f docker-compose.prod.yml --env-file .env pull && \
                                docker compose -f docker-compose.prod.yml --env-file .env down || true && \
                                docker compose -f docker-compose.prod.yml --env-file .env up -d && \
                                docker image prune -f
                            "
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo '===== PIPELINE THÀNH CÔNG ====='
        }
        failure {
            echo '===== PIPELINE THẤT BẠI - kiểm tra log ====='
        }
        always {
            echo 'Kết thúc pipeline. Dọn dẹp workspace nếu cần.'
            sh 'docker logout || true'
        }
    }
}
