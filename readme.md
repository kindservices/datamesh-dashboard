# About

This is the [data mesh idea lab](https://www.kindservices.co.uk/idea-lab) dashboard


# Installation

The server is defined as a [kubernetes service](./server/k8s/server.yaml).

We provide a convenience script for spinning it up, assuming you have [argocd installed](https://argo-cd.readthedocs.io/en/stable/).
(If not, see [our docs](https://github.com/kindservices/local-kubernetes) on testing this out/installing argocd locally)

Just run:
```bash
cd server
make installArgo
```

# Local Usage

If you're building this locally...

### Starting the server:

```shell
cd server
make run
```

## Server