# proxy

The dashboard is going to be serving up UI component which will need to talk to their own back-ends.

Those back-ends will likely not be reachable - and otherwise have CORRS issues when called from the dashboard.

To work around this, we expose this proxy endpoint which can call the endpoints on behalf of the dashboard widgets.

