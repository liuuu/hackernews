import React from 'react';
import ReactDOM from 'react-dom';

import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { BrowserRouter } from 'react-router-dom';

import { split } from 'apollo-client-preset';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

const __SIMPLE_API_ENDPOINT__ = 'https://api.graph.cool/simple/v1/cjc5ppqu20phx0181bek2mbl1';
const httpLink = new HttpLink({ uri: __SIMPLE_API_ENDPOINT__ });

const middlewareAuthLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('GC_AUTH_TOKEN');
  const authorizationHeader = token ? `Bearer ${token}` : null;
  operation.setContext({
    headers: {
      authorization: authorizationHeader,
    },
  });
  return forward(operation);
});

const httpLinkWithAuthToken = middlewareAuthLink.concat(httpLink);

const __SUBSCRIPTION_API_ENDPOINT__ =
  'wss://subscriptions.us-west-2.graph.cool/v1/cjc5ppqu20phx0181bek2mbl1';
const wsLink = new WebSocketLink({
  uri: __SUBSCRIPTION_API_ENDPOINT__,
  options: {
    reconnect: true,
    timeout: 30000,
    connectionParams: {
      authToken: localStorage.getItem('GC_AUTH_TOKEN'),
    },
  },
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLinkWithAuthToken,
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root'),
);
registerServiceWorker();
