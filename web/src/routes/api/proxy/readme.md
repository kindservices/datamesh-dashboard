# Proxy

The dashboard is going to be serving up UI component which will need to talk to their own back-ends.

Those back-ends will likely not be reachable - and otherwise have CORRS issues when called from the dashboard.

To work around this, we expose this proxy endpoint which can call the endpoints on behalf of the dashboard widgets.

## Making a REST request via the dashboard proxy

There is a simple test tool in the dashboard UI for testing requests to services in the cluster, accessible from the `<dashboard url>/proxy`


This example shows how to make a REST quest via the dashboard proxy:

```typescript

const proxyRequestBody = {
    proxy: "http://your.url:1234/foo",
    method: "POST", // one of GET, POST, PUT, DELETE, OPTIONS
    headers: {"some-header" : "foo"},  // an arbitrary json key/value object
    body: { "the-request" : "body" }
}

const responseFuture = fetch(`/api/proxy`, {
    method: 'POST',
    body: JSON.stringify(proxyRequestBody),
    headers: { 'content-type': 'application/json' }})
.then(response => {
    if (!response.ok) {
        // error handling
        throw new Error({'failure-status': response.status})
    } else {
        return response.text()
    }
})
.catch(error => {
    // error handling
})
```