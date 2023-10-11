#!/usr/bin/env bash
export BUILD_NUMBER=${BUILD_NUMBER:-local}
export MAJOR_MINOR=${MAJOR_MINOR:-0.0}
export TAG="${MAJOR_MINOR}.${BUILD_NUMBER}"
export NAME="kindservices/datamesh-dashboard-bff"
export IMG=${IMG:-$NAME:$TAG}
export PORT=${PORT:-8081}


echo "BUILD_NUMBER : $BUILD_NUMBER"
echo "         TAG : $TAG"
echo "        NAME : $NAME"

# DIR=$(cd `dirname $0` && pwd)
# pushd $DIR

build() {
    docker buildx build --platform linux/amd64,linux/arm64 -f Dockerfile.local --tag $IMG .
}

clean() {
    [[ -f app.jar ]] && rm app.jar || echo ""
}

buildInDocker() {
    docker buildx build --platform linux/amd64,linux/arm64 -f Dockerfile.inDocker --tag $IMG .
}

buildLocally() {
    scala-cli --power package App.scala -o app.jar --force --assembly
}

push() {
    set +x
    
    echo "images:"
    docker image ls

    echo "pushing  $NAME:$TAG"
    docker push $NAME:$TAG
    
    docker tag $NAME:$TAG $NAME:latest
    
    echo "pushing  $NAME:latest"
    docker push $NAME:latest
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

# convenience method for installing this app in argo, assuming argocd is installed and logged in
installArgo() {
    APP=${APP:-dashboard-bff}
    BRANCH=${BRANCH:-`git rev-parse --abbrev-ref HEAD`}

    echo "creating $APP to point at $BRANCH"
    
    argocd app create $APP \
    --repo https://github.com/kindservices/idealab-dashboard.git \
    --path server/k8s \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace data-mesh \
    --sync-policy automated \
    --auto-prune \
    --self-heal \
    --revision $BRANCH
}