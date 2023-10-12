# About

This is the [data mesh idea lab](https://www.kindservices.co.uk/idea-lab) dashboard


# Installation

The dashboard consists of a ["backend for frontend" (bff)](./server/k8s/server.yaml) and ["web"](./web/k8s/server.yaml) kubernetes service.

We provide a convenience script for spinning it up, assuming you have [argocd installed](https://argo-cd.readthedocs.io/en/stable/).
(If not, see [our docs](https://github.com/kindservices/local-kubernetes) on testing this out/installing argocd locally)

To install it on kubernetes via argocd, use `install.sh`


# Local Usage

If you're building this locally...

### Starting the bff server:

```shell
cd server
make run
```

### Starting the web server:

```shell
cd web
make run
```
