# About

This is the "backend for frontend" for our dashboard component. 

It provides an opinionated and coupled way to get information to the web front-end.

The hypothesis is that the trade-off of an extra component (and extra hop) is worth the benefit in cleaner interfaces and decoupling to the front-end.


# Building Locally
See the [Makefile](./Makefile) for build targets.e.g:

```bash
make run

make test
```

### Spinning up the Service Registry
Ultimately the dashboard needs to communcate to the service registry, which in turn keeps track of the various widgets available.

These are meant to be run as a suite of components in kubernetes. For fast local development, you'll want either those other componenets (e.g. the service registry) running in kubernetes with "[port-forwarding](https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/)" to your localhost OR otherwise be actually running those components on your localhost machine, either through your IDE.

You can read more about how to do that in the [service registry readme](https://github.com/kindservices/datamesh-service-registry).
