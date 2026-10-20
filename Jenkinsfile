// Jenkinsfile - CI/CD Pipeline: Pull code -> Build -> Test
pipeline {
    agent any

    environment {
        // Đổi lại theo repo của bạn (SSH hoặc HTTPS)
        GIT_REPO = 'https://github.com/ngan1306/du_an_truong_chung.git'
        GIT_BRANCH = 'main'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        // ==========================================================
        // BƯỚC 1: PULL CODE TỪ GIT
        // ==========================================================
        stage('1. Pull code từ Git') {
            steps {
                echo 'Đang pull code từ Git repository...'
                git branch: "${GIT_BRANCH}", url: "${GIT_REPO}"
            }
        }

        // ==========================================================
        // BƯỚC 2: BUILD ỨNG DỤNG
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
                    npm install
                    npm run build
                '''
            }
        }

        // ==========================================================
        // BƯỚC 3: CHẠY TEST
        // ==========================================================
        stage('3. Chạy test Backend') {
            steps {
                echo 'Chạy pytest cho Backend...'
                sh '''
                    cd backend
                    . ./venv/bin/activate
                    python -m pytest -v || true
                '''
            }
        }

        stage('3. Chạy test Frontend') {
            steps {
                echo 'Chạy test cho Frontend...'
                sh '''
                    cd frontend
                    npm test -- --watchAll=false || true
                '''
            }
        }

        // ==========================================================
        // BƯỚC 4 (TÙY CHỌN): BUILD IMAGE DOCKER
        // ==========================================================
        stage('4. Build Docker image') {
            steps {
                echo 'Build Docker images bằng docker-compose...'
                sh 'docker compose -f docker-compose.yml build'
            }
        }

        // ==========================================================
        // BƯỚC 5 (TÙY CHỌN): DEPLOY BẰNG ANSIBLE
        // ==========================================================
        stage('5. Deploy lên máy chủ web bằng Ansible') {
            steps {
                echo 'Chạy ansible-playbook để deploy...'
                sh '''
                    docker run --rm --network devops-net \
                      -v $PWD/ansible:/workspace \
                      -v ~/.ssh:/root/.ssh:ro \
                      ansible-controller \
                      ansible-playbook -i inventory/hosts.ini playbook/deploy.yml
                '''
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
        }
    }
}
