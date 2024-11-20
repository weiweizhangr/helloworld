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
        GITHUB_PAT = "${env.GITHUB_PAT}"
        // Kubernetes 配置
        KUBECONFIG_REPO = 'https://github.com/weiweizhangr/helloworld_config.git'
        KUBECONFIG_PATH = ''
        KUBECONFIG_FILE = ''

        // Argo CD API 相关信息
        ARGO_CD_URL = 'https://localhost:8081/'
        // ARGO_CD_TOKEN = "${env.ARGO_CD_TOKEN}"
        NAMESPACE = 'argocd'
        REPO_URL = 'https://github.com/weiweizhangr/helloworld_config.git'
        DEST_SERVER = 'https://kubernetes.default.svc'
        PATH = "./"
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
        stage('Clone Git Config Repo and Deploy to Argo CD') {
            steps {
                script {
                    // 克隆 gitconfig 仓库
                    sh """
                    git clone ${KUBECONFIG_REPO} gitconfig-repo
                    cd gitconfig-repo/${KUBECONFIG_PATH}
                    """
  
                    // 设置 KUBECONFIG 环境变量
                    withEnv(["KUBECONFIG=${WORKSPACE}/gitconfig-repo/${KUBECONFIG_PATH}/${KUBECONFIG_FILE}"]) {
                        // 应用 kubectl 命令
                        sh """
                        kubectl apply -f .
                        """
                    }
                }
            }
        }
        stage('Create Application in Argo CD') {
            steps {
                script {
                    // 调用 Argo CD API 创建应用
                    def appJson = """
                    {
                        "metadata": {
                            "name": "my-node-app",
                            "namespace": "${NAMESPACE}"
                        },
                        "spec": {
                            "destination": {
                                "server": "${DEST_SERVER}",
                                "namespace": "${NAMESPACE}"
                            },
                            "source": {
                                "repoURL": "${REPO_URL}",
                                "path": "./",
                                "targetRevision": "HEAD"
                            },
                            "project": "default"
                        }
                    }
                    """

                    sh """
                    curl -X POST -H "Content-Type: application/json"  -d '${appJson}' ${ARGO_CD_URL}
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