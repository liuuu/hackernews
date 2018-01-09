import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { ALL_LINKS_QUERY } from './LinksList';

function timeDifference(current, previous) {
  const milliSecondsPerMinute = 60 * 1000;
  const milliSecondsPerHour = milliSecondsPerMinute * 60;
  const milliSecondsPerDay = milliSecondsPerHour * 24;
  const milliSecondsPerMonth = milliSecondsPerDay * 30;
  const milliSecondsPerYear = milliSecondsPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < milliSecondsPerMinute / 3) {
    return 'just now';
  }

  if (elapsed < milliSecondsPerMinute) {
    return 'less than 1 min ago';
  } else if (elapsed < milliSecondsPerHour) {
    return `${Math.round(elapsed / milliSecondsPerMinute)} min ago`;
  } else if (elapsed < milliSecondsPerDay) {
    return `${Math.round(elapsed / milliSecondsPerHour)} h ago`;
  } else if (elapsed < milliSecondsPerMonth) {
    return `${Math.round(elapsed / milliSecondsPerDay)} days ago`;
  } else if (elapsed < milliSecondsPerYear) {
    return `${Math.round(elapsed / milliSecondsPerMonth)} mo ago`;
  }
  return `${Math.round(elapsed / milliSecondsPerYear)} years ago`;
}
const LINKS_PER_PAGE = 10;

export function timeDifferenceForDate(date) {
  const now = new Date().getTime();
  const updated = new Date(date).getTime();
  return timeDifference(now, updated);
}

class Link extends Component {
  updateStoreAfterVote = (store, createVote, linkId) => {
    const isNewPage = this.props.location.pathname.includes('new');
    const page = parseInt(this.props.match.params.page, 10);
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 10;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;
    const data = store.readQuery({ query: ALL_LINKS_QUERY, variables: { first, skip, orderBy } });

    const votedLink = data.allLinks.find(link => link.id === linkId);
    votedLink.votes = createVote.link.votes;

    store.writeQuery({ query: ALL_LINKS_QUERY, data });
  };

  _voteForLink = async () => {
    const userId = localStorage.getItem('GC_USER_ID');
    const voterIds = this.props.link.votes.map(vote => vote.user.id);

    if (voterIds.includes(userId)) {
      console.log(`User (${userId}) already voted for this link.`);
      return;
    }

    const linkId = this.props.link.id;
    await this.props.createVoteMutation({
      variables: {
        userId,
        linkId,
      },
      update: (store, { data: { createVote } }) => {
        this.updateStoreAfterVote(store, createVote, linkId);
      },
    });
  };

  render() {
    const userId = localStorage.getItem('GC_USER_ID');
    const voterIds = this.props.link.votes.map(vote => vote.user.id);
    let alreadyVoted = false;
    if (voterIds.includes(userId)) {
      alreadyVoted = true;
    }
    return (
      <div className="flex mt2 items-start">
        <div className="flex items-center">
          <span className="gray">{this.props.index + 1}.</span>
          {userId && (
            <button
              className="ml1 gray f11"
              onClick={() => this._voteForLink()}
              disabled={alreadyVoted}
            >
              ▲
            </button>
          )}
        </div>
        <div className="ml1">
          <div>
            {this.props.link.description} ({this.props.link.url})
          </div>
          <div className="f6 lh-copy gray">
            {this.props.link.votes.length} votes | by{' '}
            {this.props.link.postedBy ? this.props.link.postedBy.name : 'Unknown'}{' '}
            {timeDifferenceForDate(this.props.link.createdAt)}
          </div>
        </div>
      </div>
    );
  }
}

// type Vote @model {
//   id: ID! @isUnique
//   user: User! @relation(name: "UsersVotes")
//   link: Link! @relation(name: "VotesOnLink")
// }

const CREATE_VOTE_MUTATION = gql`
  mutation CreateVoteMutation($userId: ID!, $linkId: ID!) {
    createVote(userId: $userId, linkId: $linkId) {
      id
      link {
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
`;

export default graphql(CREATE_VOTE_MUTATION, {
  name: 'createVoteMutation',
})(withRouter(Link));
