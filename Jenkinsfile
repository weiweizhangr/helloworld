pipeline {
    agent any

    environment {
        // GitHub Packages 仓库的相关信息
        GITHUB_PACKAGE_REGISTRY = 'docker.pkg.github.com'
        GITHUB_REPOSITORY = 'weiweizhangr/helloworld'
        DOCKER_IMAGE_NAME = 'my-node-app'
        DOCKER_TAG = 'latest'
        DOCKER_IMAGE = "${GITHUB_PACKAGE_REGISTRY}/${GITHUB_REPOSITORY}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}"
        
        // GitHub 个人访问令牌 (PAT)
        GITHUB_PAT = ${env.GITHUB_PAT}
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // 构建 Docker 镜像
                    sh """
                    docker build -t ${DOCKER_IMAGE} .
                    """
                }
            }
        }

        stage('Login to GitHub Packages') {
            steps {
                script {
                    // 使用 GitHub 个人访问令牌 (PAT) 登录到 GitHub Packages
                    withCredentials([string(credentialsId: 'github-pat', variable: 'GITHUB_PAT')]) {
                        sh """
                        echo \${GITHUB_PAT} | docker login ${GITHUB_PACKAGE_REGISTRY} -u weiweizhangr --password-stdin
                        """
                    }
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    // 推送 Docker 镜像到 GitHub Packages
                    sh """
                    docker push ${DOCKER_IMAGE}
                    """
                }
            }
        }
    }

    post {
        always {
            // 清理工作
            cleanWs()
        }
    }
}