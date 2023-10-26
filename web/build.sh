#!/usr/bin/env bash
export BUILD_NUMBER=${BUILD_NUMBER:-local}
export MAJOR_MINOR=${MAJOR_MINOR:-0.0}
export TAG="${MAJOR_MINOR}.${BUILD_NUMBER}"
export NAME="kindservices/datamesh-dashboard-web"
export IMG=${IMG:-$NAME:$TAG}
export PORT=${PORT:-3000}

buildDocker() {
    docker buildx build --platform linux/amd64,linux/arm64 --tag $IMG .
}

runLocal() {
    yarn
    yarn dev
}

run() {
    echo "docker run -it --rm -p $PORT:$PORT -d $IMG"
    id=`docker run -it --rm -p $PORT:$PORT -d $IMG`
    cat > kill.sh <<EOL
docker kill $id
# clean up after ourselves
rm kill.sh
EOL
    chmod +x kill.sh

    echo "Running on port $PORT --- stop server using ./kill.sh"
}

installArgo() {
    APP=${APP:-dashboard-web}
    BRANCH=${BRANCH:-`git rev-parse --abbrev-ref HEAD`}

    echo "creating $APP in branch $BRANCH"

    kubectl create namespace data-mesh 2> /dev/null

    argocd app create $APP \
    --repo https://github.com/kindservices/datamesh-dashboard.git \
    --path web/k8s \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace data-mesh \
    --sync-policy automated \
    --auto-prune \
    --self-heal \
    --revision $BRANCH

}
