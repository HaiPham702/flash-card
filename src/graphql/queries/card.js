// src/graphql/queries/user.ts
import { gql } from '@apollo/client/core';

export const GET_CARD = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      frontTitle
      backTitle
      frontImg
      backImg
    }
  }
`;

export const GET_CARDS = gql`
  query {
    cards {
      id
      frontTitle
      backTitle
      frontImg
      backImg
    }
  }
`;

export const UPDATE_CARD = gql`
  mutation UpdateUser($id: ID!, $name: String!, $email: String!) {
    updateUser(id: $id, name: $name, email: $email) {
      id
      name
      email
    }
  }
`;
