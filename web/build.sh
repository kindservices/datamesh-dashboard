#!/usr/bin/env bash
export TAG=${TAG:-0.0.1}
export IMG=${IMG:-kindservices/dashboard-web:$TAG}
export PORT=${PORT:-3000}

buildDocker() {
    docker build --tag $IMG .
}

push() {
    docker push $IMG
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
    
    argocd app create $APP \
    --repo https://github.com/aaronp/mfe.git \
    --path dashboard/web/k8s \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace mfe \
    --sync-policy automated \
    --auto-prune \
    --self-heal \
    --revision $BRANCH

}