import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';

const httpLink = createHttpLink({
    uri: 'https://flash-card-backend-w9oj.onrender.com/graphql',
});

const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});

export default apolloClient;