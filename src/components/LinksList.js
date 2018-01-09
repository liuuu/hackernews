import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import Link from './Link';

const SUBSCRIPTION_VOTES = gql`
  subscription {
    Vote(filter: { mutation_in: [CREATED] }) {
      node {
        id
        link {
          id
          url
          description
          createdAt
          postedBy {
            id
            name
          }
          votes {
            id
            user {
              id
            }
          }
        }
        user {
          id
        }
      }
    }
  }
`;

const SUBSCRIPTION_ALL_LINKS = gql`
  subscription {
    Link(filter: { mutation_in: [CREATED] }) {
      node {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`;

class LinkList extends Component {
  componentDidMount() {
    this.unsubscribeLinks = this._subscribeToNewLinks();
    this.unsubscribeVotes = this._subscribeToNewVotes();
  }

  componentWillUnmount() {
    if (this.unsubscribeLinks) {
      this.unsubscribeLinks();
    }
    if (this.unsubscribeVotes) {
      this.unsubscribeVotes();
    }
  }

  _subscribeToNewLinks = () =>
    this.props.allLinksQuery.subscribeToMore({
      document: SUBSCRIPTION_ALL_LINKS,
      updateQuery: (previous, { subscriptionData }) => {
        console.log('subscriptionData', subscriptionData);

        const newAllLinks = [subscriptionData.data.Link.node, ...previous.allLinks];
        const result = {
          ...previous,
          allLinks: newAllLinks,
        };
        return result;
      },
    });

  _subscribeToNewVotes = () => {
    this.props.allLinksQuery.subscribeToMore({
      document: SUBSCRIPTION_VOTES,
      updateQuery: (previous, { subscriptionData }) => {
        console.log('previous', previous);
        console.log('subscriptionData', subscriptionData);

        const votedLinkIndex = previous.allLinks.findIndex(link => link.id === subscriptionData.data.Vote.node.link.id);
        const link = subscriptionData.data.Vote.node.link;
        const newAllLinks = previous.allLinks.slice();
        newAllLinks[votedLinkIndex] = link;
        const result = {
          ...previous,
          allLinks: newAllLinks,
        };
        return result;
      },
    });
  };

  render() {
    if (this.props.allLinksQuery && this.props.allLinksQuery.loading) {
      return <div>Loading</div>;
    }

    if (this.props.allLinksQuery && this.props.allLinksQuery.error) {
      return <div>Error</div>;
    }

    const linksToRender = this.props.allLinksQuery.allLinks;

    return (
      <div>
        {linksToRender.map((link, index) => <Link key={link.id} link={link} index={index} />)}
      </div>
    );
  }
}

export const ALL_LINKS_QUERY = gql`
  query AllLinksQuery {
    allLinks(orderBy: createdAt_DESC) {
      id
      createdAt
      url
      description
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`;

export default graphql(ALL_LINKS_QUERY, {
  name: 'allLinksQuery',
  options: {
    fetchPolicy: 'network-only',
  },
})(LinkList);
