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
        ARGO_CD_URL = 'https://localhost:8081/api/v1/applications'
        // ARGO_CD_TOKEN = "${env.ARGO_CD_TOKEN}"
        NAMESPACE = 'argocd'
        REPO_URL = 'https://github.com/weiweizhangr/helloworld_config.git'
        DEST_SERVER = 'https://kubernetes.default.svc'
        ARGO_CD_USERNAME = "admin"
        ARGO_CD_PASSWORD = "DkN1LPRIUq7cd4a4"

    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // stage('Build Docker Image') {
        //     steps {
        //         script {
        //             // 构建 Docker 镜像
        //             sh """
        //             docker build -t ${DOCKER_IMAGE} .
        //             """
        //         }
        //     }
        // }

        // stage('Login to GitHub Packages') {
        //     steps {
        //         script {
        //             // 使用 GitHub 个人访问令牌 (PAT) 登录到 GitHub Packages
        //             withCredentials([string(credentialsId: 'github-pat', variable: 'GITHUB_PAT')]) {
        //                 sh """
        //                 echo \${GITHUB_PAT} | docker login ${GITHUB_PACKAGE_REGISTRY} -u weiweizhangr --password-stdin
        //                 """
        //             }
        //         }
        //     }
        // }

        // stage('Push Docker Image') {
        //     steps {
        //         script {
        //             // 推送 Docker 镜像到 GitHub Packages
        //             sh """
        //             docker push ${DOCKER_IMAGE}
        //             """
        //         }
        //     }
        // }
stage('Create Application in Argo CD') {
    steps {
        script {
            // 获取认证令牌
            def response = sh(script: """
                curl -s -k -X POST \
                    -H 'Content-Type: application/json' \
                    -d '{"username": "${env.ARGO_CD_USERNAME}", "password": "${env.ARGO_CD_PASSWORD}"}' \
                     https://localhost:8081/api/v1/session
            """, returnStdout: true).trim()

            def json = readJSON text: response
            def ARGO_CD_TOKEN = json.token

            if (!ARGO_CD_TOKEN) {
                error "Failed to authenticate with Argo CD"
            }
            
            // 创建应用的 JSON 数据
            def appJson = """
            {
                "metadata": {
                    "name": "my-node-app",
                    "namespace": "${env.NAMESPACE}"
                },
                "spec": {
                    "destination": {
                        "server": "${env.DEST_SERVER}",
                        "namespace": "${env.NAMESPACE}"
                    },
                    "source": {
                        "repoURL": "${env.REPO_URL}",
                        "path": "./",
                        "targetRevision": "HEAD"
                    },
                    "project": "default"
                }
            }
            """

            // 使用认证令牌调用 Argo CD API 创建应用
            def createAppResponse = sh(script: """
                curl -s -k -X POST \
                    -H 'Content-Type: application/json' \
                    -H 'Authorization: Bearer ${ARGO_CD_TOKEN}' \
                    -d '${appJson}' \
                    ${env.ARGO_CD_URL}
            """, returnStdout: true).trim()

            // 解析响应并检查是否成功创建应用
            def createAppJson = readJSON text: createAppResponse
            if (createAppJson.code != 200 || !createAppJson.message?.startsWith("created")) {
                error "Failed to create application in Argo CD: ${createAppResponse}"
            } else {
                echo "Successfully created application in Argo CD"
            }
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