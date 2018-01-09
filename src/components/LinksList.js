import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import Link from './Link';

const LINKS_PER_PAGE = 10;

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

  _getLinksToRender = (isNewPage) => {
    if (isNewPage) {
      return this.props.allLinksQuery.allLinks;
    }
    const rankedLinks = this.props.allLinksQuery.allLinks.slice();
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
    return rankedLinks;
  };

  _nextPage = () => {
    const page = parseInt(this.props.match.params.page, 10);
    if (page <= this.props.allLinksQuery._allLinksMeta.count / LINKS_PER_PAGE) {
      const nextPage = page + 1;
      this.props.history.push(`/new/${nextPage}`);
    }
  };

  _previousPage = () => {
    const page = parseInt(this.props.match.params.page, 10);
    if (page > 1) {
      const previousPage = page - 1;
      this.props.history.push(`/new/${previousPage}`);
    }
  };

  render() {
    if (this.props.allLinksQuery && this.props.allLinksQuery.loading) {
      return <div>Loading</div>;
    }

    if (this.props.allLinksQuery && this.props.allLinksQuery.error) {
      return <div>Error</div>;
    }

    const isNewPage = this.props.location.pathname.includes('new');
    const linksToRender = this._getLinksToRender(isNewPage);
    const page = parseInt(this.props.match.params.page, 10);

    return (
      <div>
        {linksToRender.map((link, index) => <Link key={link.id} link={link} index={index} />)}
        {isNewPage && (
          <div className="flex ml4 mv3 gray">
            <button className="pointer mr2" onClick={() => this._previousPage()}>
              Previous
            </button>
            <button className="pointer" onClick={() => this._nextPage()}>
              Next
            </button>
          </div>
        )}
      </div>
    );
  }
}

// export const ALL_LINKS_QUERY = gql`
//   query AllLinksQuery {
//     allLinks(orderBy: createdAt_DESC) {
//       id
//       createdAt
//       url
//       description
//       postedBy {
//         id
//         name
//       }
//       votes {
//         id
//         user {
//           id
//         }
//       }
//     }
//   }
// `;

export const ALL_LINKS_QUERY = gql`
  query AllLinksQuery($first: Int, $skip: Int, $orderBy: LinkOrderBy) {
    allLinks(first: $first, skip: $skip, orderBy: $orderBy) {
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
    _allLinksMeta {
      count
    }
  }
`;

// export default graphql(ALL_LINKS_QUERY, {
//   name: 'allLinksQuery',
//   options: {
//     fetchPolicy: 'network-only',
//   },
// })(LinkList);

export default graphql(ALL_LINKS_QUERY, {
  name: 'allLinksQuery',
  options: (ownProps) => {
    const page = parseInt(ownProps.match.params.page, 10);
    const isNewPage = ownProps.location.pathname.includes('new');
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 10;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;
    return {
      fetchPolicy: 'network-only',
      variables: { first, skip, orderBy },
    };
  },
})(LinkList);
